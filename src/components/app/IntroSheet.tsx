import { useNavigate } from "@tanstack/react-router";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";
import { Button, Note, Sheet } from "./ui";

export function IntroSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useApp();
  const navigate = useNavigate();
  const steps = [1, 2, 3, 4] as const;
  return (
    <Sheet open={open} onClose={onClose} title={t("intro_title")}>
      <ol className="space-y-3">
        {steps.map((i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
              {i}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t(`intro_${i}_t`)}</p>
              <p className="text-xs text-muted-foreground">{t(`intro_${i}_b`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 space-y-2">
        <Button
          size="lg"
          onClick={() => {
            actions.startTour();
            onClose();
            navigate({ to: "/sourcing/requirement" });
          }}
        >
          {t("startGuided")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            actions.markIntroSeen();
            onClose();
          }}
        >
          {t("exploreFreely")}
        </Button>
        <Note>{t("demoData")} — concept prototype, not a live Meesho product.</Note>
      </div>
    </Sheet>
  );
}
