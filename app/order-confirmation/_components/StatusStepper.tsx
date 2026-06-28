import type { OrderStatus } from "@/lib/tracking";

type Props = { status: OrderStatus };

const STEPS = ["Placed", "Packing", "On the way", "Delivered"] as const;

// How far along the 4-step bar each status sits (index of the active step).
function activeIndex(status: OrderStatus): number {
  switch (status) {
    case "pending":
      return 1; // Packing
    case "assigned":
    case "out_for_delivery":
      return 2; // On the way
    case "delivered":
      return 3; // Delivered
    case "cancelled":
      return 0;
  }
}

export default function StatusStepper({ status }: Props) {
  const active = activeIndex(status);
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div key={label} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${i <= active ? "bg-brand" : "bg-border"}`} />
              )}
              <div
                className={`mx-1 h-3 w-3 rounded-full ${
                  done || current ? "bg-brand" : "bg-border"
                } ${current ? "ring-4 ring-brand/20" : ""}`}
              />
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < active ? "bg-brand" : "bg-border"}`} />
              )}
            </div>
            <span
              className={`mt-2 text-xs ${
                done || current ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
