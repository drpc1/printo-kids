import { useRef, useState, type SubmitEvent } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  barAfterFavoriteSave,
  profileNameError,
  sortProfiles,
  visitAfterDelete,
  withFavorite,
  writeChildProfiles,
  type ChildProfile,
  type VisitAfterDelete,
} from "@/lib/child-profiles";
import { readLastUsed } from "@/lib/last-used";
import { levelById, type LevelId } from "@/lib/maze/levels";
import { CHARACTER_CHOICES, characterRow } from "@/lib/sheet/character";
import { cn } from "@/lib/utils";

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

const NAME_ERROR_TEXT = {
  empty: "Wpisz imię",
  "too-long": "Imię może mieć najwyżej 40 znaków",
  duplicate: "Takie imię już jest",
} as const;

const SAVE_ERROR_TEXT = "Nie udało się zapisać profilu";

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];
type ProfilePanel = "menu" | "form" | "delete" | "edit" | "favorite-list" | "draft-list";

export function ProfileCorner({
  profiles,
  activeId,
  barCharacter,
  barLevel,
  ask,
  onCreated,
  onChoose,
  onFavoriteSaved,
  onDeleted,
}: {
  profiles: readonly ChildProfile[];
  activeId: string | null;
  barCharacter: CharacterChoice;
  barLevel: LevelId;
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
  const [draftCharacter, setDraftCharacter] = useState<CharacterChoice>("none");
  const [formError, setFormError] = useState<string | null>(null);
  const [favoriteDraft, setFavoriteDraft] = useState<CharacterChoice>(
    activeProfile === null ? barCharacter : characterChoice(activeProfile.character),
  );
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChildProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function abandonFavoriteDraft(): void {
    favoriteLock.current = false;
    setFavoriteDraft(activeProfile === null ? barCharacter : characterChoice(activeProfile.character));
    setFavoriteError(null);
  }

  function clearPendingViews(): void {
    deleteLock.current = false;
    setPendingDelete(null);
    setDeleteError(null);
  }

  function openCreateForm(): void {
    createLock.current = false;
    clearPendingViews();
    setDraftName("");
    setDraftCharacter("none");
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

  function cancelEdit(): void {
    abandonFavoriteDraft();
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

  function openEdit(profile: ChildProfile): void {
    if (profile.id === activeId) {
      if (activeProfile === null) {
        return;
      }
      setFavoriteDraft(characterChoice(activeProfile.character));
      setFavoriteError(null);
      setPanel("edit");
      return;
    }
    setFavoriteDraft(characterChoice(profile.character));
    setFavoriteError(null);
    onChoose(profile);
    setPanel("edit");
  }

  function openDelete(profile: ChildProfile): void {
    deleteLock.current = false;
    setPendingDelete(profile);
    setDeleteError(null);
    setPanel("delete");
  }

  function confirmDelete(): void {
    if (deleteLock.current || pendingDelete === null) {
      return;
    }
    const next = visitAfterDelete(
      profiles,
      pendingDelete.id,
      activeId,
      { character: barCharacter, level: barLevel },
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

  function handleFavoriteSelect(id: CharacterChoice): void {
    favoriteLock.current = false;
    setFavoriteDraft(id);
  }

  function openFavoriteList(): void {
    setPanel("favorite-list");
  }

  function openDraftList(): void {
    setPanel("draft-list");
  }

  function handleFavoritePicked(id: CharacterChoice): void {
    handleFavoriteSelect(id);
    setPanel("edit");
  }

  function handleDraftPicked(id: CharacterChoice): void {
    setDraftCharacter(id);
    setPanel("form");
  }

  function handleSaveFavorite(): void {
    if (favoriteLock.current || activeProfile === null) {
      return;
    }
    const previousFavorite = activeProfile.character;
    if (favoriteDraft === previousFavorite && barLevel === activeProfile.level) {
      return;
    }
    const nextProfiles = withFavorite(profiles, activeProfile.id, favoriteDraft, barLevel, ALLOWED_CHARACTER_IDS);
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
    setPanel("menu");
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
      level: barLevel,
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
        ) : panel === "favorite-list" || panel === "draft-list" ? (
          <div className={cn("flex flex-col gap-2")}>
            <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
            <CharacterChoiceRows
              selected={panel === "draft-list" ? draftCharacter : favoriteDraft}
              onSelect={panel === "draft-list" ? handleDraftPicked : handleFavoritePicked}
            />
          </div>
        ) : panel === "edit" && activeProfile !== null ? (
          <div className={cn("flex flex-col gap-4")}>
            <DialogTitle className={cn("break-words")}>{activeProfile.name}</DialogTitle>
            <ProfileCharacterControl character={favoriteDraft} onOpen={openFavoriteList} />
            <ProfileLevelNote level={barLevel} />
            {favoriteError !== null ? (
              <p id="child-profile-save-error" role="alert" className={cn("text-destructive text-sm")}>
                {favoriteError}
              </p>
            ) : null}
            <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Anuluj
              </Button>
              <Button
                type="button"
                disabled={favoriteDraft === activeProfile.character && barLevel === activeProfile.level}
                aria-describedby={favoriteError !== null ? "child-profile-save-error" : undefined}
                onClick={handleSaveFavorite}
              >
                Zapisz
              </Button>
            </div>
          </div>
        ) : panel !== "form" ? (
          <div className={cn("flex flex-col gap-2")}>
            {profiles.length >= 1 ? (
              <>
                <DialogTitle className={cn("sr-only")}>Profil</DialogTitle>
                <TooltipProvider>
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
                          handleChoose(profile);
                        }}
                      >
                        <span className={cn("min-w-0 break-words")}>{profile.name}</span>
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edytuj ${profile.name}`}
                            className={cn("shrink-0")}
                            onClick={() => {
                              openEdit(profile);
                            }}
                          >
                            <Pencil className={cn("size-4")} aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edytuj</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Usuń ${profile.name}`}
                            className={cn("shrink-0")}
                            onClick={() => {
                              openDelete(profile);
                            }}
                          >
                            <Trash2 className={cn("size-4")} aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Usuń</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </TooltipProvider>
              </>
            ) : (
              <DialogTitle className={cn("break-words")}>Profil</DialogTitle>
            )}
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
            <ProfileCharacterControl character={draftCharacter} onOpen={openDraftList} />
            <ProfileLevelNote level={barLevel} />
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

function ProfileCharacterControl({ character, onOpen }: { character: CharacterChoice; onOpen: () => void }) {
  const choice = characterRow(character);
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`Postać: ${choice.label}`}
      className={cn("h-auto w-full justify-start px-4 py-2 text-lg")}
      onClick={onOpen}
    >
      {choice.src !== null ? <img src={choice.src} alt="" width={40} height={40} className={cn("size-10")} /> : null}
      {choice.label}
      <ChevronDown className={cn("size-4")} aria-hidden />
    </Button>
  );
}

function ProfileLevelNote({ level }: { level: LevelId }) {
  return <p className={cn("text-muted-foreground px-4 text-base")}>{`Poziom: ${levelById(level).label}`}</p>;
}

export function CharacterChoiceRows({
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

function characterChoice(value: string): CharacterChoice {
  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
