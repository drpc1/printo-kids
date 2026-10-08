import { useEffect, useState, type SubmitEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { profileNameError, readChildProfiles, writeChildProfiles, type ChildProfile } from "@/lib/child-profiles";
import { readLastUsed, writeLastUsed } from "@/lib/last-used";
import { generateMaze, mazeForSheet, type Maze, type MazeCell } from "@/lib/maze/generate";
import { layoutSheet } from "@/lib/sheet/layout";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const LABEL_COLUMN = 6;
const CHARACTER_MARK_SIZE = 30;

const CHARACTER_CHOICES = [
  { id: "none", label: "Bez postaci", src: null },
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
] as const;

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

const NAME_ERROR_TEXT = {
  empty: "Wpisz imię",
  "too-long": "Imię może mieć najwyżej 40 znaków",
  duplicate: "Takie imię już jest",
} as const;

const SAVE_ERROR_TEXT = "Nie udało się zapisać profilu";

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];
type ProfilePanel = "menu" | "form";

interface VisitStart {
  profiles: ChildProfile[];
  activeId: string | null;
  character: CharacterChoice;
}

interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function WorksheetGenerator() {
  const [visit] = useState(() => readVisitStart(localStorage));
  const [profiles, setProfiles] = useState(visit.profiles);
  const [activeId, setActiveId] = useState(visit.activeId);
  const [character, setCharacter] = useState(visit.character);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const selectedChoice = CHARACTER_CHOICES.find((option) => option.id === character) ?? CHARACTER_CHOICES[0];

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    const hasMaze = maze !== null;
    main.classList.toggle("has-maze", hasMaze);
    main.classList.toggle("justify-start", hasMaze);
    main.classList.toggle("justify-center", !hasMaze);
  }, [maze]);

  function handleGenerate(): void {
    const next = mazeForSheet(generateMaze(Math.random));
    if (next !== null) {
      setMaze(next);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  function handleProfileCreated(profile: ChildProfile): void {
    setProfiles((current) => [...current, profile]);
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
  }

  const hasMaze = maze !== null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={character}
        onCreated={handleProfileCreated}
      />
      {hasMaze ? (
        <div className={cn("flex w-full items-center justify-between gap-4 print:hidden")}>
          <div className={cn("flex min-w-0 items-center gap-3")}>
            <CharacterChoiceControl
              character={character}
              selectedChoice={selectedChoice}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={setCharacter}
              rememberLastUsed={activeId === null}
            />
            <GenerateButton onClick={handleGenerate} tone="quiet" />
          </div>
          <Button
            type="button"
            variant="default"
            onClick={handlePrint}
            className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
          >
            Drukuj
          </Button>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          <CharacterChoiceControl
            character={character}
            selectedChoice={selectedChoice}
            choiceOpen={choiceOpen}
            onOpenChange={setChoiceOpen}
            onSelect={setCharacter}
            rememberLastUsed={activeId === null}
          />
          <GenerateButton onClick={handleGenerate} tone="hero" />
        </div>
      )}
      {hasMaze ? <MazeSheet maze={maze} characterSrc={selectedChoice.src} /> : null}
    </div>
  );
}

function GenerateButton({ onClick, tone }: { onClick: () => void; tone: "hero" | "quiet" }) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
    >
      Generuj
    </Button>
  );
}

function ProfileCorner({
  profiles,
  activeId,
  barCharacter,
  onCreated,
}: {
  profiles: readonly ChildProfile[];
  activeId: string | null;
  barCharacter: CharacterChoice;
  onCreated: (profile: ChildProfile) => void;
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;
  const cornerLabel = activeProfile === null ? "Profil" : activeProfile.name;
  const favorite =
    activeProfile === null ? null : (CHARACTER_CHOICES.find((option) => option.id === activeProfile.character) ?? null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [panel, setPanel] = useState<ProfilePanel>("menu");
  const [draftName, setDraftName] = useState("");
  const [draftCharacter, setDraftCharacter] = useState<CharacterChoice>(barCharacter);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreateForm(): void {
    setDraftName("");
    setDraftCharacter(barCharacter);
    setFormError(null);
    setPanel("form");
  }

  function handleProfileOpenChange(open: boolean): void {
    if (open) {
      if (profiles.length === 0) {
        openCreateForm();
      } else {
        setPanel("menu");
        setDraftName("");
        setFormError(null);
      }
    }
    setProfileOpen(open);
  }

  function handleCancel(): void {
    setDraftName("");
    setFormError(null);
    if (profiles.length === 0) {
      setProfileOpen(false);
      return;
    }
    setPanel("menu");
  }

  function handleCreate(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nameError = profileNameError(
      draftName,
      profiles.map((profile) => profile.name),
    );
    if (nameError !== null) {
      setFormError(NAME_ERROR_TEXT[nameError]);
      return;
    }

    const profile: ChildProfile = {
      id: crypto.randomUUID(),
      name: draftName.trim(),
      character: draftCharacter,
    };
    const saved = writeChildProfiles(localStorage, [...profiles, profile]);
    if (!saved) {
      setFormError(SAVE_ERROR_TEXT);
      return;
    }

    onCreated(profile);
    setDraftName("");
    setFormError(null);
    setProfileOpen(false);
  }

  return (
    <Dialog open={profileOpen} onOpenChange={handleProfileOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={cornerLabel}
          className={cn(
            "text-muted-foreground hover:text-foreground fixed top-4 right-4 z-40 h-auto max-w-48 px-2 py-1 text-base font-normal print:hidden",
          )}
        >
          <span className={cn("min-w-0 truncate")}>{cornerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        {panel === "menu" ? (
          <div className={cn("flex flex-col gap-2")}>
            <DialogTitle className={cn("break-words")}>
              {activeProfile === null ? "Profil" : activeProfile.name}
            </DialogTitle>
            {favorite !== null ? <SavedCharacter choice={favorite} /> : null}
            <Button
              type="button"
              variant="ghost"
              className={cn("h-auto w-full justify-start px-4 py-2 text-lg")}
              onClick={openCreateForm}
            >
              Dodaj profil
            </Button>
          </div>
        ) : (
          <form className={cn("flex flex-col gap-4")} onSubmit={handleCreate}>
            <DialogTitle className={cn("sr-only")}>Imię</DialogTitle>
            <div className={cn("flex flex-col gap-2")}>
              <label htmlFor="child-profile-name" className={cn("text-sm font-medium")}>
                Imię
              </label>
              <Input
                id="child-profile-name"
                value={draftName}
                onChange={(event) => {
                  setDraftName(event.target.value);
                }}
                aria-invalid={formError !== null}
                aria-describedby={formError !== null ? "child-profile-error" : undefined}
                autoComplete="off"
              />
              {formError !== null ? (
                <p id="child-profile-error" role="alert" className={cn("text-destructive text-sm")}>
                  {formError}
                </p>
              ) : null}
            </div>
            <CharacterChoiceRows selected={draftCharacter} onSelect={setDraftCharacter} />
            <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Anuluj
              </Button>
              <Button type="submit">Utwórz</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SavedCharacter({ choice }: { choice: (typeof CHARACTER_CHOICES)[number] }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 text-lg")}>
      {choice.src !== null ? <img src={choice.src} alt="" width={40} height={40} className={cn("size-10")} /> : null}
      {choice.label}
    </div>
  );
}

function CharacterChoiceControl({
  character,
  selectedChoice,
  choiceOpen,
  onOpenChange,
  onSelect,
  rememberLastUsed,
}: {
  character: CharacterChoice;
  selectedChoice: (typeof CHARACTER_CHOICES)[number];
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: CharacterChoice) => void;
  rememberLastUsed: boolean;
}) {
  return (
    <Dialog open={choiceOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Postać: ${selectedChoice.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Postać:</span>
          {selectedChoice.src !== null ? (
            <img src={selectedChoice.src} alt="" width={24} height={24} className={cn("size-6")} />
          ) : null}
          {selectedChoice.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("print:hidden")} showCloseButton={false}>
        <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
        <CharacterChoiceRows
          selected={character}
          onSelect={(id) => {
            onSelect(id);
            if (rememberLastUsed) {
              writeLastUsed(localStorage, id);
            }
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function CharacterChoiceRows({
  selected,
  onSelect,
}: {
  selected: CharacterChoice;
  onSelect: (id: CharacterChoice) => void;
}) {
  return (
    <div className={cn("flex flex-col gap-2")}>
      {CHARACTER_CHOICES.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          aria-pressed={selected === option.id}
          className={cn("h-auto w-full justify-start px-4 py-2 text-lg", selected === option.id && "bg-muted")}
          onClick={() => {
            onSelect(option.id);
          }}
        >
          {option.src !== null ? (
            <img src={option.src} alt="" width={40} height={40} className={cn("size-10")} />
          ) : null}
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function MazeSheet({ maze, characterSrc }: { maze: Maze; characterSrc: string | null }) {
  const sheet = layoutSheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: maze.width,
    rows: maze.height,
    entranceColumn: LABEL_COLUMN,
    markSize: CHARACTER_MARK_SIZE,
    characterSelected: characterSrc !== null,
  });
  const cellSize = sheet.maze.width / maze.width;
  const walls = collectWalls(maze, sheet.maze.x, sheet.maze.y, cellSize);
  const mark = sheet.mark;
  const start = sheet.start;

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      role="img"
      aria-label="Labirynt"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {mark !== null && characterSrc !== null ? (
        <image href={characterSrc} x={mark.x} y={mark.y} width={mark.width} height={mark.height} />
      ) : start !== null ? (
        <text
          x={start.x}
          y={start.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={7}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {start.text}
        </text>
      ) : null}
      <text
        x={sheet.meta.x}
        y={sheet.meta.y}
        fill="var(--foreground)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={7}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {sheet.meta.text}
      </text>
      <g fill="none" stroke="var(--foreground)" strokeLinecap="square" strokeLinejoin="miter" strokeWidth={0.65}>
        {walls.map((wall) => (
          <line key={wall.id} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />
        ))}
      </g>
    </svg>
  );
}

function collectWalls(maze: Maze, originX: number, originY: number, cellSize: number): WallSegment[] {
  const walls: WallSegment[] = [];

  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      const cell = mazeCell(maze, row, col);
      if (cell === undefined) {
        continue;
      }
      const x = originX + col * cellSize;
      const y = originY + row * cellSize;
      if (row === 0 && cell.north) {
        walls.push({ id: `${row},${col},north`, x1: x, y1: y, x2: x + cellSize, y2: y });
      }
      if (cell.east) {
        walls.push({
          id: `${row},${col},east`,
          x1: x + cellSize,
          y1: y,
          x2: x + cellSize,
          y2: y + cellSize,
        });
      }
      if (cell.south) {
        walls.push({
          id: `${row},${col},south`,
          x1: x,
          y1: y + cellSize,
          x2: x + cellSize,
          y2: y + cellSize,
        });
      }
      if (col === 0 && cell.west) {
        walls.push({ id: `${row},${col},west`, x1: x, y1: y, x2: x, y2: y + cellSize });
      }
    }
  }

  return walls;
}

function mazeCell(maze: Maze, row: number, col: number): MazeCell | undefined {
  return maze.cells[row]?.[col];
}

function readVisitStart(storage: Pick<Storage, "getItem" | "setItem">): VisitStart {
  const profiles = readChildProfiles(storage, ALLOWED_CHARACTER_IDS);
  const only = profiles.length === 1 ? profiles[0] : undefined;
  if (only !== undefined) {
    return {
      profiles,
      activeId: only.id,
      character: characterChoice(only.character),
    };
  }

  return {
    profiles,
    activeId: null,
    character: characterChoice(readLastUsed(storage, ALLOWED_CHARACTER_IDS)),
  };
}

function characterChoice(value: string): CharacterChoice {
  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
