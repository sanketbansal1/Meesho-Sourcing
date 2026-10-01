import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/app/Shell";
import {
  Button,
  Card,
  Empty,
  Field,
  Input,
  Note,
  Pill,
  Row,
  SectionTitle,
  Select,
  Sheet,
  Textarea,
} from "@/components/app/ui";
import { SELLER, getProduct, getSupplier } from "@/lib/demo/catalog";
import { priceQuote, rupees } from "@/lib/demo/money";
import { actions, ORDER_FLOW } from "@/lib/demo/store";
import { formatDate, useApp } from "@/lib/useApp";

export const Route = createFileRoute("/orders/$orderId")({
  validateSearch: (search: Record<string, unknown>) => ({ placed: search.placed === true || search.placed === "true" }),
  head: () => ({
    meta: [
      { title: "Sourcing order — Meesho Sourcing concept" },
      {
        name: "description",
        content:
          "Order timeline from batch confirmation to delivery, with issue reporting and reordering in the concept prototype.",
      },
      { property: "og:title", content: "Sourcing order — Meesho Sourcing concept" },
      { property: "og:description", content: "Track a raw-material order placed through pooled sourcing." },
    ],
  }),
  component: OrderScreen,
});

function OrderScreen() {
  const { orderId } = Route.useParams();
  const { placed } = Route.useSearch();
  const { s, t, lang } = useApp();
  const navigate = useNavigate();
  const [issueOpen, setIssueOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [issue, setIssue] = useState({ type: "shortage", qty: "", desc: "", photo: false });

  const order = s.orders.find((o) => o.id === orderId);
  if (!order) {
    return (
      <Screen title={t("nav_orders")} back>
        <div className="p-4">
          <Empty>{t("none")}</Empty>
        </div>
      </Screen>
    );
  }
  const product = getProduct(order.productId)!;
  const supplier = getSupplier(product.supplierId);
  const ticket = s.tickets.find((x) => x.id === order.issueTicketId);
  const stageIndex = ORDER_FLOW.indexOf(order.stage);
  const visibleFlow = ORDER_FLOW.filter((f) => f !== "awaiting_batch" || order.route === "batch");
  const freshQuote = product.buyNow ? priceQuote(product.buyNow, order.pricing.qty) : null;

  return (
    <Screen title={order.id} back subtitle={order.productName}>
      <div className="space-y-3 px-4 pt-3">
        {placed ? (
          <Card className="border-positive/30 bg-positive-soft">
            <p className="text-sm font-bold text-positive">{t("orderPlaced")}</p>
            <Row label={t("orderId")} value={order.id} />
            <Row
              label={t("paymentMethod")}
              value={order.payment === "credit" ? t("useCredit") : t("payNowSim")}
            />
            <Row label={t("estimatedArrival")} value={formatDate(order.etaAt, lang)} />
            <p className="mt-1 text-[11px] font-semibold text-foreground">{t("whatNext")}</p>
            <p className="text-[11px] text-muted-foreground">
              {order.stage === "awaiting_batch"
                ? lang === "hi"
                  ? "बैच भरते ही आपका ऑर्डर पक्का होगा। न भरने पर पूरी रकम वापस/क्रेडिट मुक्त।"
                  : "Your order confirms as soon as the batch fills. If it does not fill, the amount is refunded or the credit released in full."
                : lang === "hi"
                  ? "सप्लायर माल तैयार करेगा, क्वालिटी जाँच होगी और सूरत से दिल्ली भेजा जाएगा।"
                  : "The supplier prepares the material, it passes a quality check and ships Surat → Delhi."}
            </p>
          </Card>
        ) : null}

        <Card>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <p className="min-w-0 text-sm font-bold text-foreground">{order.productName}</p>
            <Pill tone={order.stage === "expired_refunded" ? "warning" : "brand"}>
              {t(`stage_${order.stage}`)}
            </Pill>
          </div>
          <Row label={t("qty")} value={`${order.pricing.qty} ${product.unit}`} />
          <Row label={t("purchaseRoute")} value={order.route === "batch" ? t("buyTogether") : t("buyNow")} />
          <Row label={t("perUnitPrice")} value={rupees(order.pricing.materialPaise)} />
          <Row label={t("delivery")} value={rupees(order.pricing.deliveryPaise)} />
          <Row label={t("demoTax")} value={rupees(order.pricing.taxPaise)} tone="muted" />
          <Row label={t("totalPayable")} value={rupees(order.pricing.totalPaise)} strong />
          <Row label={t("paymentMethod")} value={order.payment === "credit" ? t("sourcingCredit") : t("payNowSim")} />
          <Row label={t("deliveryAddress")} value={SELLER.address} />
          <Row label={t("shipsFrom")} value={`${supplier.city} → ${SELLER.city}`} />
          {order.dispatchRef ? <Row label="Dispatch reference" value={order.dispatchRef} /> : null}
          {order.refunded ? (
            <Note tone="warning">
              {lang === "hi"
                ? "बैच अपनी सीमा तक नहीं पहुँचा। आपकी रकम वापस कर दी गई / क्रेडिट मुक्त कर दिया गया। दाम अपने आप बढ़ाकर नहीं लिया गया।"
                : "The batch did not reach its threshold. Your payment was refunded or reserved credit released. It was never silently converted to the higher buy-now price."}
            </Note>
          ) : null}
        </Card>

        <Card>
          <p className="text-xs font-bold text-foreground">
            <Truck className="mr-1 inline h-4 w-4" aria-hidden />
            {supplier.city} → {SELLER.city}
          </p>
          <ol className="mt-2 space-y-2">
            {visibleFlow.map((stage) => {
              const idx = ORDER_FLOW.indexOf(stage);
              const done = stageIndex >= idx && order.stage !== "expired_refunded";
              return (
                <li key={stage} className="flex items-start gap-2">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className={`text-xs ${done ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {t(`stage_${stage}`)}
                    {done ? ` · ${lang === "hi" ? "पूरा" : "done"}` : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        {order.stage === "delivered" ? (
          <Button size="lg" variant="positive" onClick={() => actions.confirmReceived(order.id)}>
            {t("confirmReceived")}
          </Button>
        ) : null}

        {order.stage === "delivered" || order.stage === "received" ? (
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => setIssueOpen(true)}>
              {t("reportIssue")}
            </Button>
            <Button variant="outline" onClick={() => setReorderOpen(true)}>
              {t("reorder")}
            </Button>
          </div>
        ) : null}

        {ticket ? (
          <Card>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <p className="min-w-0 text-xs font-bold text-foreground">
                {t("ticketCreated")} · {ticket.id}
              </p>
              <Pill tone="warning">{ticket.status.replace("_", " ")}</Pill>
            </div>
            <Row label={t("issueType")} value={ticket.issueType} />
            <Row label={t("affectedQty")} value={`${ticket.qty} ${product.unit}`} />
            <p className="text-[11px] text-muted-foreground">{ticket.description}</p>
            {ticket.resolution ? <Note>{ticket.resolution}</Note> : null}
          </Card>
        ) : null}
      </div>

      <SectionTitle>{t("specifications")}</SectionTitle>
      <div className="px-4 pb-6">
        <Card>
          {product.specs.map((sp) => (
            <Row key={sp.key} label={lang === "hi" ? sp.labelHi : sp.labelEn} value={sp.value} />
          ))}
        </Card>
      </div>

      <Sheet open={issueOpen} onClose={() => setIssueOpen(false)} title={t("reportIssue")}>
        <div className="space-y-3">
          <Field label={t("issueType")} id="i-type">
            <Select id="i-type" value={issue.type} onChange={(e) => setIssue({ ...issue, type: e.target.value })}>
              <option value="shortage">Shortage</option>
              <option value="quality">Quality</option>
              <option value="wrong_spec">Wrong specification</option>
              <option value="damage">Damage in transit</option>
            </Select>
          </Field>
          <Field label={t("affectedQty")} id="i-qty">
            <Input
              id="i-qty"
              inputMode="numeric"
              value={issue.qty}
              onChange={(e) => setIssue({ ...issue, qty: e.target.value.replace(/\D/g, "") })}
            />
          </Field>
          <Field label={t("description")} id="i-desc">
            <Textarea
              id="i-desc"
              rows={3}
              value={issue.desc}
              onChange={(e) => setIssue({ ...issue, desc: (e.target as HTMLTextAreaElement).value })}
            />
          </Field>
          <Field label={t("attachPhoto")} id="i-photo">
            <input
              id="i-photo"
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={(e) => setIssue({ ...issue, photo: Boolean(e.target.files?.length) })}
            />
          </Field>
          <Note>
            {lang === "hi"
              ? "हर शिकायत अपने आप मंज़ूर नहीं होती। टीम समीक्षा करती है और नतीजा मामले पर निर्भर करता है।"
              : "Not every complaint is automatically approved. The team reviews each case and outcomes vary."}
          </Note>
          <Button
            size="lg"
            disabled={!issue.qty || !issue.desc}
            onClick={() => {
              const id = actions.createTicket({
                orderId: order.id,
                issueType: issue.type as "shortage",
                qty: Number(issue.qty),
                description: issue.desc,
                hasPhoto: issue.photo,
              });
              setIssueOpen(false);
              toast.success(`${t("ticketCreated")}: ${id}`);
            }}
          >
            {t("submit")}
          </Button>
        </div>
      </Sheet>

      <Sheet open={reorderOpen} onClose={() => setReorderOpen(false)} title={t("reorder")}>
        <div className="space-y-2">
          <Note tone="warning">{t("reorderNote")}</Note>
          <Card>
            {product.specs.map((sp) => (
              <Row key={sp.key} label={lang === "hi" ? sp.labelHi : sp.labelEn} value={sp.value} />
            ))}
            <Row label={t("qty")} value={`${order.pricing.qty} ${product.unit}`} />
          </Card>
          {freshQuote ? (
            <Card>
              <p className="text-xs font-bold text-foreground">
                {lang === "hi" ? "मौजूदा कोटेशन" : "Currently seeded quote"}
              </p>
              <Row label={t("perUnitPrice")} value={rupees(freshQuote.materialPaise)} />
              <Row label={t("delivery")} value={rupees(freshQuote.deliveryPaise)} />
              <Row label={t("demoTax")} value={rupees(freshQuote.taxPaise)} tone="muted" />
              <Row label={t("totalPayable")} value={rupees(freshQuote.totalPaise)} strong />
            </Card>
          ) : (
            <Note tone="warning">{t("outOfRange")}</Note>
          )}
          <Button
            size="lg"
            disabled={!freshQuote}
            onClick={() => {
              setReorderOpen(false);
              navigate({
                to: "/checkout/$productId",
                params: { productId: product.id },
                search: { route: "buynow", qty: order.pricing.qty },
              });
            }}
          >
            {t("confirm")}
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}
