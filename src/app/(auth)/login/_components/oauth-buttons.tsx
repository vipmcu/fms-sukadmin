"use client";
import { signIn } from "next-auth/react";
import { useT } from "@/shared/lib/i18n/client";
import { GoogleIcon, MicrosoftIcon } from "../../_components/icons";

const PROVIDER_CONFIG = {
  google: {
    id: "google",
    icon: GoogleIcon,
  },
  microsoft: {
    id: "microsoft-entra-id",
    icon: MicrosoftIcon,
  },
} as const;

export function OAuthButtons({ providers }: { providers: ("google" | "microsoft")[] }) {
  const t = useT();
  return (
    <div className="oauth">
      {providers.map((p) => {
        const config = PROVIDER_CONFIG[p];
        const Icon = config.icon;
        return (
          <button
            key={p}
            type="button"
            className="btn-oauth"
            onClick={() => signIn(config.id, { callbackUrl: "/dashboard" })}
          >
            <Icon />
            <span>{t(`auth.provider.${p}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
