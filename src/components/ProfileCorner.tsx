import { useRef, useState, type SubmitEvent } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { LevelRow, levelRowClass } from "@/components/LevelRow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  barAfterFavoriteSave,
  profileNameError,
  profileToCreate,
  readChildProfiles,
  sortProfiles,
  visitAfterDelete,
  withFavorite,
  writeChildProfiles,
  type ChildProfile,
  type VisitAfterDelete,
} from "@/lib/child-profiles";
import type { CardSettingsMap } from "@/lib/card-settings";
import { readActiveProfile } from "@/lib/active-profile";
import { cardSummaries } from "@/lib/card-summary";
import { readLastUsed } from "@/lib/last-used";
import { DEFAULT_LEVEL_ID, LEVELS, type LevelId } from "@/lib/maze/levels";
import {
  ALLOWED_CHARACTER_IDS,
  CHARACTER_CHOICES,
  characterChoice,
  characterRow,
  OWN_IMAGE_ID,
  OWN_IMAGE_LABEL,
  type SheetCharacterId,
} from "@/lib/sheet/character";
import { copyOwnImage } from "@/lib/sheet/own-image";
import { isOwnImageDataUrl, readOwnImage, writeOwnImage } from "@/lib/sheet/own-image-store";
import { cn } from "@/lib/utils";

// Dialog rows stay at the size of Generuj and Drukuj: 16 px text below sm, 18 px from sm, 44 px tall either way.
export const DIALOG_ROW_CLASS = "h-auto justify-start px-4 py-2.5 text-base sm:py-2 sm:text-lg";

const NAME_ERROR_TEXT = {
  empty: "Wpisz imię",
  "too-long": "Imię może mieć najwyżej 40 znaków",
  duplicate: "Takie imię już jest",
} as const;

const SAVE_ERROR_TEXT = "Nie udało się zapisać profilu";
const OWN_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";
const FILE_ERROR_TEXT = {
  size: "Plik jest większy niż 8 MB.",
  type: "Wybierz plik JPEG, PNG albo WebP.",
  decode: "Nie da się otworzyć tego pliku.",
} as const;
const STORE_ERROR_TEXT = "Nie udało się zachować zdjęcia.";

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
  onClearProfile,
  newProfileCards,
}: {
  profiles: readonly ChildProfile[];
  activeId: string | null;
  barCharacter: SheetCharacterId;
  barLevel: LevelId;
  ask: boolean;
  onCreated: (profile: ChildProfile) => void;
  onChoose: (profile: ChildProfile) => void;
  onFavoriteSaved: (
    profiles: ChildProfile[],
    barCharacter: string,
    barLevel: LevelId,
    ownImageHref?: string | null,
  ) => void;
  onDeleted: (next: VisitAfterDelete) => void;
  onClearProfile: () => void;
  /** Card settings the new profile starts with: the bar of the card page it is created on. */
  newProfileCards?: CardSettingsMap;
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;
  const cornerLabel = activeProfile === null ? "Profil" : activeProfile.name;
  const [profileOpen, setProfileOpen] = useState(ask);
  const [panel, setPanel] = useState<ProfilePanel>("menu");
  const createLock = useRef(false);
  const deleteLock = useRef(false);
  const [draftName, setDraftName] = useState("");
  const [draftCharacter, setDraftCharacter] = useState<SheetCharacterId>("none");
  const [draftImageHref, setDraftImageHref] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChildProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDraftImageHref(null);
    setFormError(null);
    setFavoriteError(null);
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
        setFavoriteError(null);
      }
    } else {
      clearPendingViews();
      setPanel("menu");
      setFavoriteError(null);
    }
    setProfileOpen(open);
  }

  function handleChoose(profile: ChildProfile): void {
    setFavoriteError(null);
    onChoose(profile);
    setProfileOpen(false);
  }

  function handleClearProfile(): void {
    setFavoriteError(null);
    onClearProfile();
    setProfileOpen(false);
  }

  function openEdit(profile: ChildProfile): void {
    if (profile.id === activeId) {
      if (activeProfile === null) {
        return;
      }
      setFavoriteError(null);
      setPanel("edit");
      return;
    }
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
      readActiveProfile(localStorage),
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
      setFavoriteError(null);
    }
    onDeleted(next);
    setPanel("menu");
    if (next.profiles.length === 0) {
      setProfileOpen(false);
    }
  }

  function openFavoriteList(): void {
    setFavoriteError(null);
    setPanel("favorite-list");
  }

  function openDraftList(): void {
    setPanel("draft-list");
  }

  function handleFavoritePicked(id: SheetCharacterId): void {
    saveFavorite(id, id === OWN_IMAGE_ID ? readOwnImage(localStorage) : null);
  }

  function handleDraftPicked(id: SheetCharacterId): void {
    setDraftCharacter(id);
    if (id === OWN_IMAGE_ID) {
      setDraftImageHref(readOwnImage(localStorage));
    }
    setPanel("form");
  }

  function handleFavoriteCopied(href: string): void {
    saveFavorite(OWN_IMAGE_ID, href);
  }

  function handleDraftCopied(href: string): void {
    setDraftCharacter(OWN_IMAGE_ID);
    setDraftImageHref(href);
    setPanel("form");
  }

  /** A pick in the favorite list is the save: there is no draft and no button. The edit window shows the stored favorite. */
  function saveFavorite(id: SheetCharacterId, imageHref: string | null): void {
    setFavoriteError(null);
    if (activeProfile === null) {
      return;
    }
    setPanel("edit");
    // Read just before writing, so a change made on another open page is not overwritten with a stale list.
    const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
    const current = stored.find((profile) => profile.id === activeProfile.id);
    if (current === undefined) {
      setFavoriteError(SAVE_ERROR_TEXT);
      return;
    }
    const previousFavorite = current.character;
    if (id === previousFavorite && (id !== OWN_IMAGE_ID || imageHref === (current.image ?? null))) {
      return;
    }
    const nextProfiles = withFavorite(stored, current.id, id, current.level, ALLOWED_CHARACTER_IDS, imageHref);
    if (nextProfiles === null || !writeChildProfiles(localStorage, nextProfiles)) {
      setFavoriteError(SAVE_ERROR_TEXT);
      return;
    }
    const nextCharacter = barAfterFavoriteSave(barCharacter, previousFavorite, id);
    const sheetHref = nextCharacter !== OWN_IMAGE_ID ? null : id === OWN_IMAGE_ID ? imageHref : undefined;
    onFavoriteSaved(nextProfiles, nextCharacter, barLevel, sheetHref);
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

    const profile = profileToCreate(
      crypto.randomUUID(),
      draftName.trim(),
      draftCharacter,
      DEFAULT_LEVEL_ID,
      draftCharacter === OWN_IMAGE_ID ? readOwnImage(localStorage) : null,
      newProfileCards,
    );
    if (profile === null) {
      setFormError(SAVE_ERROR_TEXT);
      return;
    }
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
            "text-muted-foreground hover:text-foreground absolute top-4 right-4 z-40 h-auto max-w-48 px-2 py-1 text-base font-normal print:hidden sm:pointer-fine:fixed",
            "pointer-coarse:min-h-11",
          )}
        >
          <span className={cn("min-w-0 truncate")}>{cornerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn("max-h-[calc(100dvh-2rem)]")}
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
            <DialogTitle className={cn(panel === "draft-list" && "sr-only")}>
              {panel === "favorite-list" ? "Ulubiona postać" : "Wybierz postać"}
            </DialogTitle>
            <CharacterChoiceRows
              selected={
                panel === "draft-list"
                  ? draftCharacter
                  : activeProfile === null
                    ? "none"
                    : characterChoice(activeProfile.character)
              }
              onSelect={panel === "draft-list" ? handleDraftPicked : handleFavoritePicked}
              onCopied={panel === "draft-list" ? handleDraftCopied : handleFavoriteCopied}
            />
          </div>
        ) : panel === "edit" && activeProfile !== null ? (
          <div className={cn("flex flex-col gap-4")}>
            <DialogTitle className={cn("break-words")}>{activeProfile.name}</DialogTitle>
            <ProfileCharacterControl
              character={characterChoice(activeProfile.character)}
              thumbHref={savedOwnImage(activeProfile)}
              onOpen={openFavoriteList}
            />
            <ProfileSummary profile={activeProfile} />
            {favoriteError !== null ? (
              <p id="child-profile-save-error" role="alert" className={cn("text-destructive text-sm")}>
                {favoriteError}
              </p>
            ) : null}
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
                          DIALOG_ROW_CLASS,
                          "min-w-0 flex-1 text-left break-words whitespace-normal",
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
                {activeProfile !== null ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(DIALOG_ROW_CLASS, "w-full")}
                    onClick={handleClearProfile}
                  >
                    Bez profilu
                  </Button>
                ) : null}
              </>
            ) : (
              <DialogTitle className={cn("break-words")}>Profil</DialogTitle>
            )}
            <Button type="button" variant="ghost" className={cn(DIALOG_ROW_CLASS, "w-full")} onClick={openCreateForm}>
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
            <ProfileCharacterControl
              character={draftCharacter}
              thumbHref={draftCharacter === OWN_IMAGE_ID ? draftImageHref : null}
              onOpen={openDraftList}
            />
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

function savedOwnImage(profile: ChildProfile | null): string | null {
  if (profile !== null && profile.character === OWN_IMAGE_ID && isOwnImageDataUrl(profile.image)) {
    return profile.image;
  }
  return null;
}

function ProfileCharacterControl({
  character,
  thumbHref,
  onOpen,
}: {
  character: SheetCharacterId;
  thumbHref: string | null;
  onOpen: () => void;
}) {
  const catalog = character === OWN_IMAGE_ID ? null : characterRow(character);
  const label = catalog === null ? OWN_IMAGE_LABEL : catalog.label;
  const src = catalog === null ? thumbHref : catalog.src;
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`Postać: ${label}`}
      className={cn(DIALOG_ROW_CLASS, "w-full")}
      onClick={onOpen}
    >
      {src !== null ? <img src={src} alt="" width={40} height={40} className={cn("size-10")} /> : null}
      {label}
      <ChevronDown className={cn("size-4")} aria-hidden />
    </Button>
  );
}

/** What the profile remembers for each card, read-only: the bar of every card is the one place that changes it. */
function ProfileSummary({ profile }: { profile: ChildProfile }) {
  return (
    <div className={cn("flex flex-col gap-2")}>
      <p className={cn("text-muted-foreground text-sm")}>
        Ustawienia każdej karty zapamiętują się same, a ulubiona postać zmienia się tylko jawnie.
      </p>
      <ul className={cn("border-border rounded-md border")}>
        {cardSummaries(profile).map((summary) => (
          <li key={summary.id} className={cn("border-border border-t first:border-t-0")}>
            <a
              href={summary.href}
              className={cn(
                "focus-visible:ring-ring/50 flex min-h-11 items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm outline-none focus-visible:ring-[3px]",
              )}
            >
              <span className={cn("font-medium")}>{summary.title}</span>
              <span className={cn("text-muted-foreground text-right", !summary.used && "italic")}>
                {summary.detail} ›
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LevelChoiceRows({ selected, onSelect }: { selected: LevelId; onSelect: (id: LevelId) => void }) {
  return (
    <div className={cn("flex flex-col gap-2")}>
      {LEVELS.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          aria-pressed={selected === option.id}
          className={cn(
            DIALOG_ROW_CLASS,
            "w-full",
            levelRowClass(option.description),
            selected === option.id && "bg-muted",
          )}
          onClick={() => {
            onSelect(option.id);
          }}
        >
          <LevelRow label={option.label} description={option.description} typicalAge={option.typicalAge} />
        </Button>
      ))}
    </div>
  );
}

export function CharacterChoiceRows({
  selected,
  onSelect,
  onCopied,
}: {
  selected: SheetCharacterId;
  onSelect: (id: SheetCharacterId) => void;
  onCopied: (href: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [deviceHref, setDeviceHref] = useState<string | null>(() => readOwnImage(localStorage));
  const [fileError, setFileError] = useState<string | null>(null);

  function openFile(): void {
    inputRef.current?.click();
  }

  async function handleFile(file: File): Promise<void> {
    const ticket = request.current + 1;
    request.current = ticket;
    const result = await copyOwnImage(file);
    if (ticket !== request.current) {
      return;
    }
    if ("reason" in result) {
      setFileError(FILE_ERROR_TEXT[result.reason]);
      return;
    }
    const saved = writeOwnImage(localStorage, result.href);
    if (ticket !== request.current) {
      return;
    }
    if (!saved) {
      setFileError(STORE_ERROR_TEXT);
      return;
    }
    setDeviceHref(result.href);
    setFileError(null);
    onCopied(result.href);
  }

  return (
    <div className={cn("flex flex-col gap-2")}>
      {CHARACTER_CHOICES.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant="ghost"
          aria-pressed={selected === option.id}
          className={cn(DIALOG_ROW_CLASS, "w-full", selected === option.id && "bg-muted")}
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
      <div className={cn("flex w-full items-start gap-2")}>
        <Button
          type="button"
          variant="ghost"
          aria-pressed={selected === OWN_IMAGE_ID}
          className={cn(DIALOG_ROW_CLASS, "min-w-0 flex-1", selected === OWN_IMAGE_ID && "bg-muted")}
          onClick={() => {
            if (deviceHref === null) {
              openFile();
              return;
            }
            onSelect(OWN_IMAGE_ID);
          }}
        >
          {deviceHref !== null ? (
            <img src={deviceHref} alt="" width={40} height={40} className={cn("size-10 object-contain")} />
          ) : null}
          {OWN_IMAGE_LABEL}
        </Button>
        {deviceHref !== null ? (
          <Button type="button" variant="ghost" className={cn("shrink-0")} onClick={openFile}>
            Zmień
          </Button>
        ) : null}
      </div>
      {fileError !== null ? (
        <p role="alert" className={cn("text-destructive text-sm")}>
          {fileError}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={OWN_IMAGE_ACCEPT}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("sr-only")}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file !== undefined) {
            void handleFile(file);
          }
        }}
      />
    </div>
  );
}
