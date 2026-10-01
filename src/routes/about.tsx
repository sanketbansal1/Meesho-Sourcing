import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/app/Shell";
import { Card, Note, SectionTitle } from "@/components/app/ui";
import { useApp } from "@/lib/useApp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About this concept — Meesho Sourcing" },
      {
        name: "description",
        content:
          "Who Meesho Sourcing serves, seller and supplier benefits, the procurement-to-sales ecosystem and every demo assumption used in this prototype.",
      },
      { property: "og:title", content: "About this concept — Meesho Sourcing" },
      {
        property: "og:description",
        content: "Evaluator notes for the Meesho Sourcing concept prototype, including demo assumptions.",
      },
    ],
  }),
  component: AboutScreen,
});

const BLOCKS: { en: [string, string[]]; hi: [string, string[]] }[] = [
  {
    en: [
      "Who it serves",
      [
        "Sellers: small manufacturers like Aarav Apparel in Delhi who buy raw materials, make finished goods and sell them on Meesho.",
        "Material suppliers: manufacturers such as the fictional Surat Textile Works who supply raw materials to Meesho.",
      ],
    ],
    hi: [
      "किसके लिए",
      [
        "सेलर: दिल्ली के आरव अपैरल जैसे छोटे निर्माता जो कच्चा माल खरीदते हैं, सामान बनाते हैं और मीशो पर बेचते हैं।",
        "मटीरियल सप्लायर: काल्पनिक सूरत टेक्सटाइल वर्क्स जैसे निर्माता जो मीशो को कच्चा माल देते हैं।",
      ],
    ],
  },
  {
    en: [
      "Seller benefits",
      [
        "Reach material suppliers beyond the local market.",
        "Compare delivered prices, not just unit prices.",
        "Buy a small share inside a larger combined order.",
        "Optional approved procurement credit, repaid from sales settlements.",
      ],
    ],
    hi: [
      "सेलर को फ़ायदा",
      [
        "स्थानीय बाज़ार से आगे के सप्लायर तक पहुँच।",
        "सिर्फ़ यूनिट दाम नहीं, डिलीवर्ड दाम की तुलना।",
        "बड़े संयुक्त ऑर्डर में छोटा हिस्सा खरीदना।",
        "वैकल्पिक मंज़ूर क्रेडिट, जो बिक्री सेटलमेंट से चुकता है।",
      ],
    ],
  },
  {
    en: [
      "Supplier benefits",
      [
        "One consolidated requirement instead of many tiny enquiries.",
        "Clear specifications, quantities and required dates before quoting.",
        "Meesho is the purchaser on the confirmed order.",
      ],
    ],
    hi: [
      "सप्लायर को फ़ायदा",
      [
        "कई छोटी पूछताछ की जगह एक संयुक्त माँग।",
        "कोटेशन से पहले स्पष्ट स्पेसिफिकेशन, मात्रा और तारीख़ें।",
        "पक्के ऑर्डर पर खरीदार मीशो होता है।",
      ],
    ],
  },
  {
    en: [
      "Procurement-to-sales ecosystem",
      [
        "Materials in, finished goods out: the same business buys inputs through Meesho Sourcing and sells outputs on the Meesho marketplace.",
        "Repayment is linked to those marketplace settlements, which is what makes sales-linked credit coherent.",
      ],
    ],
    hi: [
      "खरीद-से-बिक्री तक",
      [
        "माल अंदर, तैयार सामान बाहर: वही व्यवसाय मीशो सोर्सिंग से कच्चा माल लेता है और मीशो पर बेचता है।",
        "किश्त उन्हीं सेटलमेंट से जुड़ी है, इसीलिए बिक्री-आधारित क्रेडिट समझ में आता है।",
      ],
    ],
  },
  {
    en: [
      "Revenue mechanism",
      [
        "Revenue mechanism is being validated; this prototype demonstrates procurement, pooled demand and sales-linked repayment.",
        "No commission, material markup, supplier subscription or sourcing service fee is modelled. Credit principal repayment is not revenue, and delivery-cost recovery is not profit.",
        "The concept preserves Meesho's zero marketplace commission positioning.",
      ],
    ],
    hi: [
      "राजस्व तरीका",
      [
        "राजस्व का तरीका अभी जाँचा जा रहा है; यह प्रोटोटाइप खरीद, साझा माँग और बिक्री-आधारित भुगतान दिखाता है।",
        "कोई कमीशन, मार्कअप, सब्सक्रिप्शन या सोर्सिंग शुल्क नहीं रखा गया। क्रेडिट मूलधन की वापसी राजस्व नहीं है।",
        "कॉन्सेप्ट मीशो की ज़ीरो मार्केटप्लेस कमीशन स्थिति बनाए रखता है।",
      ],
    ],
  },
  {
    en: [
      "Demo assumptions",
      [
        "All prices, suppliers, batches, credit limits and outcomes are illustrative demo data.",
        "A 5% demo tax is applied on material plus delivery for arithmetic consistency; it is a prototype assumption, not a tax determination.",
        "Headline savings are stated on a pre-tax delivered basis against the seller's own entered local quote.",
        "The ₹400 delivery rate applies only within the quoted 50–200 m range; other quantities need a fresh quote.",
        "Supplier badges mean the record was seeded as onboarded; no inspection, reviews or quality claims are implied.",
        "The assistant is deterministic keyword matching, not AI, and never judges physical quality.",
        "Credit terms (₹25,000 limit, 30 days, 20% deduction, ₹0 charges) are illustrative, not a lending offer.",
        "The concept is inspired by marketplace-plus-upstream-procurement models; the credit mechanism is not an existing Meesho or Hyperpure policy.",
        "No research, interviews, adoption statistics, measured savings or real supplier commitments are claimed.",
      ],
    ],
    hi: [
      "डेमो धारणाएँ",
      [
        "सभी दाम, सप्लायर, बैच, क्रेडिट सीमा और नतीजे सिर्फ़ उदाहरण डेटा हैं।",
        "गणना की संगति के लिए मटीरियल+डिलीवरी पर 5% डेमो टैक्स लगाया गया है; यह कर निर्धारण नहीं है।",
        "बचत टैक्स से पहले डिलीवर्ड आधार पर, सेलर के दर्ज लोकल रेट की तुलना में दिखाई गई है।",
        "₹400 डिलीवरी दर सिर्फ़ 50–200 मी सीमा में मान्य है; बाकी मात्रा पर नया कोटेशन चाहिए।",
        "सप्लायर बैज सिर्फ़ डेमो ऑनबोर्डिंग दिखाता है; कोई जाँच या गुणवत्ता दावा नहीं।",
        "असिस्टेंट सिर्फ़ तय नियमों पर आधारित है, असली AI नहीं, और गुणवत्ता नहीं आँकता।",
        "क्रेडिट शर्तें (₹25,000 सीमा, 30 दिन, 20% कटौती, ₹0 शुल्क) सिर्फ़ उदाहरण हैं।",
        "यह कॉन्सेप्ट मार्केटप्लेस + अपस्ट्रीम खरीद मॉडल से प्रेरित है; क्रेडिट तरीका मीशो या हाइपरप्योर की मौजूदा नीति नहीं है।",
        "कोई शोध, इंटरव्यू, आँकड़े, मापी गई बचत या असली सप्लायर प्रतिबद्धता का दावा नहीं है।",
      ],
    ],
  },
];

function AboutScreen() {
  const { t, lang } = useApp();
  return (
    <Screen title={t("aboutConcept")} back subtitle={t("conceptDemo")}>
      <div className="space-y-3 px-4 pt-3">
        <Note tone="brand">
          {lang === "hi"
            ? "यह एक स्वतंत्र कॉन्सेप्ट प्रोटोटाइप है, मीशो का असली उत्पाद नहीं।"
            : "This is an independent concept prototype, not an actual Meesho product."}
        </Note>
        {BLOCKS.map((b) => {
          const [title, items] = lang === "hi" ? b.hi : b.en;
          return (
            <div key={title}>
              <SectionTitle>{title}</SectionTitle>
              <Card>
                <ul className="list-inside list-disc space-y-1.5 text-xs text-muted-foreground">
                  {items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </Card>
            </div>
          );
        })}
      </div>
      <div className="h-6" />
    </Screen>
  );
}
