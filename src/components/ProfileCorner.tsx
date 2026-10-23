import { useRef, useState, type SubmitEvent } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  barAfterFavoriteSave,
  profileNameError,
  hrefForFavoriteSave,
  profileToCreate,
  sortProfiles,
  visitAfterDelete,
  withFavorite,
  writeChildProfiles,
  type ChildProfile,
  type VisitAfterDelete,
} from "@/lib/child-profiles";
import { readActiveProfile } from "@/lib/active-profile";
import { readLastUsed } from "@/lib/last-used";
import { LEVELS, levelById, type LevelId } from "@/lib/maze/levels";
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

type ProfilePanel =
  "menu" | "form" | "delete" | "edit" | "favorite-list" | "draft-list" | "favorite-level-list" | "draft-level-list";

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
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;
  const cornerLabel = activeProfile === null ? "Profil" : activeProfile.name;
  const [profileOpen, setProfileOpen] = useState(ask);
  const [panel, setPanel] = useState<ProfilePanel>("menu");
  const createLock = useRef(false);
  const favoriteLock = useRef(false);
  const deleteLock = useRef(false);
  const [draftName, setDraftName] = useState("");
  const [draftCharacter, setDraftCharacter] = useState<SheetCharacterId>("none");
  const [draftImageHref, setDraftImageHref] = useState<string | null>(null);
  const [draftLevel, setDraftLevel] = useState<LevelId>(barLevel);
  const [formError, setFormError] = useState<string | null>(null);
  const [favoriteDraft, setFavoriteDraft] = useState<SheetCharacterId>(
    activeProfile === null ? barCharacter : characterChoice(activeProfile.character),
  );
  const [favoriteImageHref, setFavoriteImageHref] = useState<string | null>(savedOwnImage(activeProfile));
  const [favoriteImageTouched, setFavoriteImageTouched] = useState(false);
  const [favoriteLevelDraft, setFavoriteLevelDraft] = useState<LevelId>(
    activeProfile === null ? barLevel : activeProfile.level,
  );
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ChildProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function abandonFavoriteDraft(): void {
    favoriteLock.current = false;
    const source = activeProfile;
    setFavoriteDraft(source === null ? barCharacter : characterChoice(source.character));
    setFavoriteImageHref(savedOwnImage(source));
    setFavoriteImageTouched(false);
    setFavoriteLevelDraft(source === null ? barLevel : source.level);
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
    setDraftImageHref(null);
    setDraftLevel(barLevel);
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

  function handleClearProfile(): void {
    abandonFavoriteDraft();
    onClearProfile();
    setProfileOpen(false);
  }

  function openEdit(profile: ChildProfile): void {
    if (profile.id === activeId) {
      if (activeProfile === null) {
        return;
      }
      setFavoriteDraft(characterChoice(activeProfile.character));
      setFavoriteImageHref(savedOwnImage(activeProfile));
      setFavoriteImageTouched(false);
      setFavoriteLevelDraft(activeProfile.level);
      setFavoriteError(null);
      setPanel("edit");
      return;
    }
    setFavoriteDraft(characterChoice(profile.character));
    setFavoriteImageHref(savedOwnImage(profile));
    setFavoriteImageTouched(false);
    setFavoriteLevelDraft(profile.level);
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
      const nextActive = next.profiles.find((profile) => profile.id === next.activeId) ?? null;
      favoriteLock.current = false;
      setFavoriteDraft(nextActive === null ? characterChoice(next.character) : characterChoice(nextActive.character));
      setFavoriteImageHref(savedOwnImage(nextActive));
      setFavoriteImageTouched(false);
      setFavoriteLevelDraft(nextActive === null ? next.level : nextActive.level);
      setFavoriteError(null);
    }
    onDeleted(next);
    setPanel("menu");
    if (next.profiles.length === 0) {
      setProfileOpen(false);
    }
  }

  function handleFavoriteSelect(id: SheetCharacterId): void {
    favoriteLock.current = false;
    setFavoriteDraft(id);
    if (id === OWN_IMAGE_ID) {
      setFavoriteImageHref(readOwnImage(localStorage));
      setFavoriteImageTouched(true);
      return;
    }
    setFavoriteImageTouched(false);
  }

  function openFavoriteList(): void {
    setPanel("favorite-list");
  }

  function openDraftList(): void {
    setPanel("draft-list");
  }

  function openFavoriteLevelList(): void {
    setPanel("favorite-level-list");
  }

  function openDraftLevelList(): void {
    setPanel("draft-level-list");
  }

  function handleFavoritePicked(id: SheetCharacterId): void {
    handleFavoriteSelect(id);
    setPanel("edit");
  }

  function handleDraftPicked(id: SheetCharacterId): void {
    setDraftCharacter(id);
    if (id === OWN_IMAGE_ID) {
      setDraftImageHref(readOwnImage(localStorage));
    }
    setPanel("form");
  }

  function handleFavoriteCopied(href: string): void {
    favoriteLock.current = false;
    setFavoriteDraft(OWN_IMAGE_ID);
    setFavoriteImageHref(href);
    setFavoriteImageTouched(true);
    setPanel("edit");
  }

  function handleDraftCopied(href: string): void {
    setDraftCharacter(OWN_IMAGE_ID);
    setDraftImageHref(href);
    setPanel("form");
  }

  function handleFavoriteLevelPicked(id: LevelId): void {
    favoriteLock.current = false;
    setFavoriteLevelDraft(id);
    setPanel("edit");
  }

  function handleDraftLevelPicked(id: LevelId): void {
    setDraftLevel(id);
    setPanel("form");
  }

  function handleSaveFavorite(): void {
    if (favoriteLock.current || activeProfile === null) {
      return;
    }
    const previousFavorite = activeProfile.character;
    const previousLevel = activeProfile.level;
    const sameStoredFavorite = favoriteDraft === previousFavorite && favoriteLevelDraft === previousLevel;
    if (sameStoredFavorite && !(favoriteImageTouched && favoriteDraft === OWN_IMAGE_ID)) {
      return;
    }
    const imageHref = hrefForFavoriteSave(
      favoriteDraft,
      favoriteImageTouched,
      readOwnImage(localStorage),
      activeProfile.image,
    );
    const nextProfiles = withFavorite(
      profiles,
      activeProfile.id,
      favoriteDraft,
      favoriteLevelDraft,
      ALLOWED_CHARACTER_IDS,
      imageHref,
    );
    if (nextProfiles === null) {
      if (favoriteDraft === OWN_IMAGE_ID) {
        setFavoriteError(SAVE_ERROR_TEXT);
      }
      return;
    }
    favoriteLock.current = true;
    const saved = writeChildProfiles(localStorage, nextProfiles);
    if (!saved) {
      favoriteLock.current = false;
      setFavoriteError(SAVE_ERROR_TEXT);
      return;
    }
    const nextCharacter = barAfterFavoriteSave(barCharacter, previousFavorite, favoriteDraft);
    const sheetHref = nextCharacter !== OWN_IMAGE_ID ? null : favoriteDraft === OWN_IMAGE_ID ? imageHref : undefined;
    onFavoriteSaved(
      nextProfiles,
      nextCharacter,
      barAfterFavoriteSave(barLevel, previousLevel, favoriteLevelDraft),
      sheetHref,
    );
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

    const profile = profileToCreate(
      crypto.randomUUID(),
      draftName.trim(),
      draftCharacter,
      draftLevel,
      draftCharacter === OWN_IMAGE_ID ? readOwnImage(localStorage) : null,
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
            <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
            <CharacterChoiceRows
              selected={panel === "draft-list" ? draftCharacter : favoriteDraft}
              onSelect={panel === "draft-list" ? handleDraftPicked : handleFavoritePicked}
              onCopied={panel === "draft-list" ? handleDraftCopied : handleFavoriteCopied}
            />
          </div>
        ) : panel === "favorite-level-list" || panel === "draft-level-list" ? (
          <div className={cn("flex flex-col gap-2")}>
            <DialogTitle className={cn("sr-only")}>Wybierz poziom</DialogTitle>
            <LevelChoiceRows
              selected={panel === "draft-level-list" ? draftLevel : favoriteLevelDraft}
              onSelect={panel === "draft-level-list" ? handleDraftLevelPicked : handleFavoriteLevelPicked}
            />
          </div>
        ) : panel === "edit" && activeProfile !== null ? (
          <div className={cn("flex flex-col gap-4")}>
            <DialogTitle className={cn("break-words")}>{activeProfile.name}</DialogTitle>
            <ProfileCharacterControl
              character={favoriteDraft}
              thumbHref={favoriteDraft === OWN_IMAGE_ID ? favoriteImageHref : null}
              onOpen={openFavoriteList}
            />
            <ProfileLevelControl level={favoriteLevelDraft} onOpen={openFavoriteLevelList} />
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
                disabled={
                  favoriteDraft === activeProfile.character &&
                  favoriteLevelDraft === activeProfile.level &&
                  !(favoriteImageTouched && favoriteDraft === OWN_IMAGE_ID)
                }
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
            <ProfileLevelControl level={draftLevel} onOpen={openDraftLevelList} />
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

function ProfileLevelControl({ level, onOpen }: { level: LevelId; onOpen: () => void }) {
  const label = levelById(level).label;
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={`Poziom: ${label}`}
      className={cn(DIALOG_ROW_CLASS, "w-full")}
      onClick={onOpen}
    >
      <span>Poziom:</span>
      {label}
      <ChevronDown className={cn("size-4")} aria-hidden />
    </Button>
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
          className={cn(DIALOG_ROW_CLASS, "w-full", selected === option.id && "bg-muted")}
          onClick={() => {
            onSelect(option.id);
          }}
        >
          {option.label}
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
