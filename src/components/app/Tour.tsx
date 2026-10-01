import { useNavigate } from "@tanstack/react-router";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";
import { Button } from "./ui";

export const TOUR_STEPS: { en: string; hi: string; to: string; search?: Record<string, string> }[] = [
  {
    en: "1. Aarav makes garments in Delhi and needs 100 m of black cotton jersey.",
    hi: "1. आरव दिल्ली में कपड़े बनाते हैं और उन्हें 100 मी काली कॉटन जर्सी चाहिए।",
    to: "/",
  },
  {
    en: "2. Describe the requirement and let the assistant structure it.",
    hi: "2. ज़रूरत बताइए और असिस्टेंट से उसे व्यवस्थित कराइए।",
    to: "/sourcing/requirement",
  },
  {
    en: "3. Compare delivered options from Surat, Ludhiana and Delhi.",
    hi: "3. सूरत, लुधियाना और दिल्ली के डिलीवर्ड विकल्प तुलना कीजिए।",
    to: "/sourcing/product/fab-jersey-black",
  },
  {
    en: "4. Join the pooled batch with your 100 m share.",
    hi: "4. अपने 100 मी हिस्से के साथ साझा बैच में जुड़िए।",
    to: "/sourcing/product/fab-jersey-black",
  },
  {
    en: "5. Check out using approved sourcing credit.",
    hi: "5. मंज़ूर सोर्सिंग क्रेडिट से चेकआउट कीजिए।",
    to: "/checkout/fab-jersey-black",
    search: { route: "batch", qty: "100" },
  },
  {
    en: "6. Switch to the material supplier and open the consolidated order.",
    hi: "6. मटीरियल सप्लायर पर जाकर संयुक्त ऑर्डर देखिए।",
    to: "/supplier/orders",
  },
  {
    en: "7. Advance delivery from Demo controls.",
    hi: "7. डेमो कंट्रोल से डिलीवरी आगे बढ़ाइए।",
    to: "/demo",
  },
  {
    en: "8. Simulate a sales settlement and watch repayment.",
    hi: "8. बिक्री सेटलमेंट सिम्युलेट कीजिए और किश्त देखिए।",
    to: "/payments",
  },
  {
    en: "9. Reorder the same specification with a fresh quote.",
    hi: "9. वही स्पेसिफिकेशन नए कोटेशन के साथ दोबारा मँगाइए।",
    to: "/orders",
  },
];

export function TourBar() {
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  if (!s.tour.active) return null;
  const step = TOUR_STEPS[Math.min(s.tour.step, TOUR_STEPS.length - 1)]!;
  const isLast = s.tour.step >= TOUR_STEPS.length - 1;

  return (
    <div className="fixed bottom-[62px] left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 border-t border-primary/20 bg-primary-soft p-3">
      <p className="text-[11px] font-semibold text-primary">
        {t("guidedJourney")} · {t("step")} {s.tour.step + 1}/{TOUR_STEPS.length}
      </p>
      <p className="mt-1 text-xs text-foreground">{lang === "hi" ? step.hi : step.en}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            if (step.to === "/supplier/orders") actions.setRole("supplier");
            if (step.to === "/" || step.to === "/payments" || step.to === "/orders")
              actions.setRole("seller");
            navigate({ to: step.to, search: step.search });
          }}
        >
          {t("openScreen")}
        </Button>
        {!isLast ? (
          <Button size="sm" variant="outline" onClick={() => actions.setTourStep(s.tour.step + 1)}>
            {t("next")}
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => actions.endTour()}>
          {t("exitTour")}
        </Button>
      </div>
    </div>
  );
}
