import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  barAfterFavoriteSave,
  openingVisit,
  profileNameError,
  readChildProfiles,
  sortProfiles,
  visitAfterDelete,
  withFavorite,
  writeChildProfiles,
  type ChildProfile,
  type VisitAfterDelete,
} from "@/lib/child-profiles";
import { readLastUsed, writeLastUsed } from "@/lib/last-used";
import { generateMaze, mazeForSheet, type Maze, type MazeCell } from "@/lib/maze/generate";
import { CHARACTER_CHOICES, characterRow, characterSheetSrc } from "@/lib/sheet/character";
import { layoutSheet } from "@/lib/sheet/layout";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const LABEL_COLUMN = 6;
const CHARACTER_MARK_SIZE = 30;

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

const NAME_ERROR_TEXT = {
  empty: "Wpisz imię",
  "too-long": "Imię może mieć najwyżej 40 znaków",
  duplicate: "Takie imię już jest",
} as const;

const SAVE_ERROR_TEXT = "Nie udało się zapisać profilu";

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];
type ProfilePanel = "menu" | "form" | "delete" | "switch";

interface VisitStart {
  profiles: ChildProfile[];
  activeId: string | null;
  character: CharacterChoice;
  ask: boolean;
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
  const [ask, setAsk] = useState(visit.ask);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const waitingForChild = profiles.length >= 2 && activeId === null;
  const selectedChoice = characterRow(character);

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
    if (waitingForChild) {
      return;
    }
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

  function handleProfileChosen(profile: ChildProfile): void {
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
  }

  function handleFavoriteSaved(nextProfiles: ChildProfile[], nextBar: string): void {
    setProfiles(nextProfiles);
    setCharacter(characterChoice(nextBar));
  }

  function handleDeleted(next: VisitAfterDelete): void {
    setProfiles(next.profiles);
    setActiveId(next.activeId);
    setCharacter(characterChoice(next.character));
    setAsk(next.ask);
  }

  const hasMaze = maze !== null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={character}
        ask={ask}
        onCreated={handleProfileCreated}
        onChoose={handleProfileChosen}
        onFavoriteSaved={handleFavoriteSaved}
        onDeleted={handleDeleted}
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
            <GenerateButton onClick={handleGenerate} tone="quiet" disabled={waitingForChild} />
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
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
        </div>
      )}
      {hasMaze ? <MazeSheet maze={maze} characterId={character} /> : null}
    </div>
  );
}

function GenerateButton({
  onClick,
  tone,
  disabled,
}: {
  onClick: () => void;
  tone: "hero" | "quiet";
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
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
  ask,
  onCreated,
  onChoose,
  onFavoriteSaved,
  onDeleted,
}: {
  profiles: readonly ChildProfile[];
  activeId: string | null;
  barCharacter: CharacterChoice;
  ask: boolean;
  onCreated: (profile: ChildProfile) => void;
  onChoose: (profile: ChildProfile) => void;
  onFavoriteSaved: (profiles: ChildProfile[], barCharacter: string) => void;
  onDeleted: (next: VisitAfterDelete) => void;
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;
  const cornerLabel = activeProfile === null ? "Profil" : activeProfile.name;
  const [profileOpen, setProfileOpen] = useState(ask);
  const [panel, setPanel] = useState<ProfilePanel>("menu");
  const createLock = useRef(false);
  const favoriteLock = useRef(false);
  const deleteLock = useRef(false);
  const [draftName, setDraftName] = useState("");
  const [draftCharacter, setDraftCharacter] = useState<CharacterChoice>(barCharacter);
  const [formError, setFormError] = useState<string | null>(null);
  const [favoriteDraft, setFavoriteDraft] = useState<CharacterChoice>(
    activeProfile === null ? barCharacter : characterChoice(activeProfile.character),
  );
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChildProfile | null>(null);
  const [pendingSwitch, setPendingSwitch] = useState<ChildProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  function abandonFavoriteDraft(): void {
    favoriteLock.current = false;
    setFavoriteDraft(activeProfile === null ? barCharacter : characterChoice(activeProfile.character));
    setFavoriteError(null);
  }

  function clearPendingViews(): void {
    deleteLock.current = false;
    setPendingDelete(null);
    setDeleteError(null);
    setPendingSwitch(null);
    setSwitchError(null);
  }

  function openCreateForm(): void {
    createLock.current = false;
    clearPendingViews();
    setDraftName("");
    setDraftCharacter(barCharacter);
    setFormError(null);
    abandonFavoriteDraft();
    setPanel("form");
  }

  function cancelDelete(): void {
    deleteLock.current = false;
    setPendingDelete(null);
    setDeleteError(null);
    setPanel("menu");
  }

  function handleProfileOpenChange(open: boolean): void {
    if (!open && panel === "delete") {
      cancelDelete();
      return;
    }
    if (open) {
      if (profiles.length === 0) {
        openCreateForm();
      } else {
        setPanel("menu");
        setDraftName("");
        setFormError(null);
        clearPendingViews();
        abandonFavoriteDraft();
      }
    } else {
      clearPendingViews();
      setPanel("menu");
      abandonFavoriteDraft();
    }
    setProfileOpen(open);
  }

  function handleChoose(profile: ChildProfile): void {
    abandonFavoriteDraft();
    onChoose(profile);
    setProfileOpen(false);
  }

  function handleNameClick(profile: ChildProfile): void {
    if (profile.id === activeId) {
      handleChoose(profile);
      return;
    }
    if (activeProfile !== null && favoriteDraft !== activeProfile.character) {
      favoriteLock.current = false;
      setPendingSwitch(profile);
      setSwitchError(null);
      setPanel("switch");
      return;
    }
    handleChoose(profile);
  }

  function openDelete(profile: ChildProfile): void {
    deleteLock.current = false;
    setPendingDelete(profile);
    setDeleteError(null);
    setPanel("delete");
  }

  function openActiveDelete(): void {
    if (activeProfile === null) {
      return;
    }
    openDelete(activeProfile);
  }

  function confirmDelete(): void {
    if (deleteLock.current || pendingDelete === null) {
      return;
    }
    const next = visitAfterDelete(
      profiles,
      pendingDelete.id,
      activeId,
      barCharacter,
      readLastUsed(localStorage, ALLOWED_CHARACTER_IDS),
    );
    deleteLock.current = true;
    const saved = writeChildProfiles(localStorage, next.profiles);
    if (!saved) {
      deleteLock.current = false;
      setDeleteError(SAVE_ERROR_TEXT);
      return;
    }
    setDeleteError(null);
    setPendingDelete(null);
    if (next.activeId !== activeId) {
      const nextActive = next.profiles.find((profile) => profile.id === next.activeId) ?? null;
      favoriteLock.current = false;
      setFavoriteDraft(nextActive === null ? characterChoice(next.character) : characterChoice(nextActive.character));
      setFavoriteError(null);
    }
    onDeleted(next);
    setPanel("menu");
    if (next.profiles.length === 0) {
      setProfileOpen(false);
    }
  }

  function handleSwitchWithoutSave(): void {
    if (pendingSwitch === null) {
      return;
    }
    const target = pendingSwitch;
    setPendingSwitch(null);
    setSwitchError(null);
    setPanel("menu");
    handleChoose(target);
  }

  function handleSaveAndSwitch(): void {
    if (favoriteLock.current || activeProfile === null || pendingSwitch === null) {
      return;
    }
    const nextProfiles = withFavorite(profiles, activeProfile.id, favoriteDraft, ALLOWED_CHARACTER_IDS);
    if (nextProfiles === null) {
      return;
    }
    const target = pendingSwitch;
    favoriteLock.current = true;
    const saved = writeChildProfiles(localStorage, nextProfiles);
    if (!saved) {
      favoriteLock.current = false;
      setSwitchError(SAVE_ERROR_TEXT);
      return;
    }
    setSwitchError(null);
    setPendingSwitch(null);
    setPanel("menu");
    onFavoriteSaved(nextProfiles, target.character);
    handleChoose(target);
    favoriteLock.current = true;
  }

  function handleFavoriteSelect(id: CharacterChoice): void {
    favoriteLock.current = false;
    setFavoriteDraft(id);
  }

  function handleSaveFavorite(): void {
    if (favoriteLock.current || activeProfile === null) {
      return;
    }
    const previousFavorite = activeProfile.character;
    if (favoriteDraft === previousFavorite) {
      return;
    }
    const nextProfiles = withFavorite(profiles, activeProfile.id, favoriteDraft, ALLOWED_CHARACTER_IDS);
    if (nextProfiles === null) {
      return;
    }
    favoriteLock.current = true;
    const saved = writeChildProfiles(localStorage, nextProfiles);
    if (!saved) {
      favoriteLock.current = false;
      setFavoriteError(SAVE_ERROR_TEXT);
      return;
    }
    onFavoriteSaved(nextProfiles, barAfterFavoriteSave(barCharacter, previousFavorite, favoriteDraft));
    setFavoriteError(null);
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
    if (createLock.current) {
      return;
    }
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
    createLock.current = true;
    const saved = writeChildProfiles(localStorage, [...profiles, profile]);
    if (!saved) {
      createLock.current = false;
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
      <DialogContent
        className={cn("max-h-[calc(100dvh-2rem)] overflow-y-auto")}
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (panel !== "delete") {
            return;
          }
          event.preventDefault();
          cancelDelete();
        }}
        onInteractOutside={(event) => {
          if (panel !== "delete") {
            return;
          }
          event.preventDefault();
          cancelDelete();
        }}
      >
        {panel === "delete" && pendingDelete !== null ? (
          <div className={cn("flex flex-col gap-4")}>
            <DialogTitle className={cn("break-words")}>{`Usunąć profil ${pendingDelete.name}?`}</DialogTitle>
            {deleteError !== null ? (
              <p id="child-profile-delete-error" role="alert" className={cn("text-destructive text-sm")}>
                {deleteError}
              </p>
            ) : null}
            <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}>
              <Button type="button" variant="outline" onClick={cancelDelete}>
                Anuluj
              </Button>
              <Button
                type="button"
                aria-describedby={deleteError !== null ? "child-profile-delete-error" : undefined}
                onClick={confirmDelete}
              >
                Usuń
              </Button>
            </div>
          </div>
        ) : panel === "switch" && pendingSwitch !== null ? (
          <div className={cn("flex flex-col gap-2")}>
            <DialogTitle className={cn("sr-only")}>Profil</DialogTitle>
            {switchError !== null ? (
              <p id="child-profile-switch-error" role="alert" className={cn("text-destructive text-sm")}>
                {switchError}
              </p>
            ) : null}
            <Button
              type="button"
              className={cn("h-auto w-full justify-start px-4 py-2 text-lg break-words whitespace-normal")}
              aria-describedby={switchError !== null ? "child-profile-switch-error" : undefined}
              onClick={handleSaveAndSwitch}
            >
              Zapisz i przełącz
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn("h-auto w-full justify-start px-4 py-2 text-lg break-words whitespace-normal")}
              onClick={handleSwitchWithoutSave}
            >
              Przełącz bez zapisu
            </Button>
          </div>
        ) : panel !== "form" ? (
          <div className={cn("flex flex-col gap-2")}>
            {profiles.length >= 2 ? (
              <>
                <DialogTitle className={cn("sr-only")}>Profil</DialogTitle>
                {sortProfiles(profiles).map((profile) => (
                  <div key={profile.id} className={cn("flex w-full items-start gap-2")}>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-pressed={profile.id === activeId}
                      className={cn(
                        "h-auto min-w-0 flex-1 justify-start px-4 py-2 text-left text-lg break-words whitespace-normal",
                        profile.id === activeId && "bg-muted",
                      )}
                      onClick={() => {
                        handleNameClick(profile);
                      }}
                    >
                      <span className={cn("min-w-0 break-words")}>{profile.name}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn("h-auto shrink-0 px-4 py-2 text-lg")}
                      onClick={() => {
                        openDelete(profile);
                      }}
                    >
                      Usuń
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <DialogTitle className={cn("break-words")}>
                {activeProfile === null ? "Profil" : activeProfile.name}
              </DialogTitle>
            )}
            {activeProfile !== null ? (
              <>
                <CharacterChoiceRows selected={favoriteDraft} onSelect={handleFavoriteSelect} />
                {favoriteError !== null ? (
                  <p id="child-profile-save-error" role="alert" className={cn("text-destructive text-sm")}>
                    {favoriteError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  disabled={favoriteDraft === activeProfile.character}
                  aria-describedby={favoriteError !== null ? "child-profile-save-error" : undefined}
                  onClick={handleSaveFavorite}
                >
                  Zapisz
                </Button>
              </>
            ) : null}
            {profiles.length === 1 && activeProfile !== null ? (
              <Button
                type="button"
                variant="ghost"
                className={cn("h-auto w-full justify-start px-4 py-2 text-lg")}
                onClick={openActiveDelete}
              >
                Usuń
              </Button>
            ) : null}
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

function MazeSheet({ maze, characterId }: { maze: Maze; characterId: CharacterChoice }) {
  const characterSrc = characterSheetSrc(characterId);
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
  const opening = openingVisit(profiles, readLastUsed(storage, ALLOWED_CHARACTER_IDS));
  return {
    profiles,
    activeId: opening.activeId,
    character: characterChoice(opening.character),
    ask: opening.ask,
  };
}

function characterChoice(value: string): CharacterChoice {
  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
