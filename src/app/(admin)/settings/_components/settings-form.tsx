"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nameTh: initial.nameTh, nameEn: initial.nameEn, logoUrl: initial.logoUrl ?? "", palette: initial.palette as PaletteId });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("settings.logoInvalidType"));
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(t("settings.logoTooLarge"));
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadLogoAction(fd);
      if (!res.ok) {
        toast.error(res.error.fieldErrors?.file?.[0] || t("settings.logoUploadError"));
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
      toast.success(t("settings.logoUploadSuccess"));
    } catch {
      toast.error(t("settings.logoUploadError"));
    } finally {
      setUploading(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) { setErrors(r.error.fieldErrors ?? {}); if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`)); return; }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.logoHint")} error={errors.logoUrl?.[0]}>
              <div className="logo-up">
                <div className="prev" aria-label="Logo preview">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? t("settings.logoUploading") : t("settings.logoUpload")}
                    </Button>
                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading}
                        onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                        className="text-destructive hover:text-destructive gap-1.5"
                      >
                        <X className="h-4 w-4" />
                        {t("settings.logoRemove")}
                      </Button>
                    )}
                  </div>
                  <input
                    id="s-logo"
                    type="text"
                    value={form.logoUrl}
                    placeholder="/uploads/logos/... หรือ https://..."
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  />
                </div>
              </div>
            </LiyonField>
          </div>
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}
