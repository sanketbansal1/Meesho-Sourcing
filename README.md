# Meesho Sourcing

### Interactive concept prototype for the Meesho DICE competition

**Helping small manufacturers source raw materials, pool demand and manage procurement payments within the Meesho ecosystem.**

[**Explore the live prototype →**](https://pixel-perfect-view-6597.lovable.app)

## The concept

Meesho Sourcing explores an upstream procurement experience for businesses that buy raw materials, manufacture finished goods and sell them on Meesho.

The prototype visualises how these businesses could discover materials, compare delivered costs, combine small requirements into larger supplier orders and use optional sourcing credit repaid through marketplace sales settlements.

It includes two connected perspectives: the **seller buying raw materials** and the **material supplier fulfilling demand**.

## What you can explore

| Experience | What the prototype demonstrates |
| --- | --- |
| Material discovery | Browse fabrics, trims, packaging and jewellery components. |
| Requirement capture | Describe a requirement or enter specifications through a structured form. |
| Delivered-cost comparison | Compare material price and delivery charges, with a separate illustrative tax breakdown. |
| Pooled purchasing | Join a shared batch with a smaller quantity and see progress towards the supplier threshold. |
| Purchase options | Explore pooled buying or an available buy-now quote. |
| Sourcing credit | View available, reserved and outstanding credit, and simulate repayment from sales settlements. |
| Order tracking | Explore confirmation, preparation, quality check, dispatch and delivery stages using demo controls. |
| Supplier workspace | Review requirements, submit quotes, inspect consolidated purchase orders and record dispatch details. |
| Post-purchase experience | Confirm receipt, report an issue and explore reordering. |
| Language support | Switch between English and Hindi. |

## Recommended walkthrough

The main scenario follows **Aarav Apparel**, a garment business in Delhi sourcing **100 metres of black cotton jersey**.

1. **Start fresh:** open **Demo → Reset demo** if you have explored the prototype before.
2. **Explore sourcing:** open the black cotton jersey product and review its specifications and delivered-cost comparison.
3. **Join the batch:** keep the quantity at **100 m**. The seeded batch already has **900 m** committed against a **1,000 m** threshold.
4. **Check out:** select simulated sourcing credit, acknowledge the demo terms and place the order.
5. **View the supplier side:** switch to the supplier role through **Demo**, then open **Orders** to inspect the consolidated purchase order and allocations.
6. **Explore fulfilment:** use **Demo → Advance fulfilment** to move the seller order through its stages. For supplier dispatch, first advance the seller order to **Quality check**, then submit a dispatch reference from the supplier order.
7. **See repayment:** return to the seller's **Payments** screen, open sales settlements and simulate a settlement. Review the repayment deduction, seller payout and outstanding balance.
8. **Explore post-purchase:** once the order is delivered, confirm receipt, report an issue or inspect the reorder flow.

You can also explore requirement capture and supplier quoting separately. The custom-quote branch currently ends at quote review; the catalogue checkout demonstrates order placement.

A guided journey is available through **Demo**. You can exit it at any time and navigate independently.

## Demo controls

The **Demo** button provides evaluator controls for:

- Switching between seller and supplier views.
- Advancing fulfilment and simulating sample delivery.
- Expiring an open batch to explore cancellation and refund or credit-release behaviour.
- Simulating marketplace settlements.
- Advancing the demo date.
- Resetting the prototype to its initial state.

State is stored locally in your browser. Use the same browser session to explore both roles. Resetting clears your simulated activity.

## Prototype scope

This is an independent competition concept prototype designed to communicate the proposed user experience and workflows. It is not an official Meesho product or a production procurement platform.

- Suppliers, prices, batch commitments, transactions and credit terms shown in the interface are illustrative scenario data.
- Payments, credit, fulfilment, verification badges and supplier operations are simulated; no real transaction takes place.
- The requirement assistant uses deterministic matching, and the sample voice control inserts an example requirement.
- The 5% tax rate is an illustrative calculation assumption. Displayed credit terms are scenario assumptions, not a lending offer.
- The prototype uses a fixed demo clock so scenarios can be replayed consistently.

## Run locally

Install a current Node.js version compatible with Vite 8, then run:

```bash
git clone https://github.com/sanketbansal1/Meesho-Sourcing.git
cd Meesho-Sourcing
npm install
npm run dev
```

To build and preview:

```bash
npm run build
npm run preview
```

## Built with

React · TypeScript · TanStack Start / Router · Vite · Tailwind CSS · Radix UI · Lucide icons

Developed with Lovable.
