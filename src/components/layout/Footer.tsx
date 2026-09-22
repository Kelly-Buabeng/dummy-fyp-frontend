import { Link } from "react-router-dom";
import { useHealthStatus } from "@/hooks/useHealthStatus";
import { cn } from "@/lib/utils";

type FooterLink =
  | { kind: "internal"; to: string; label: string }
  | { kind: "external"; href: string; label: string };

function internal(to: string, label: string): FooterLink {
  return { kind: "internal", to, label };
}

function external(href: string, label: string): FooterLink {
  return { kind: "external", href, label };
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      internal("/live-demo", "Live Demo"),
      internal("/heatmap", "Heatmap"),
      internal("/dashboard", "Dashboard"),
    ],
  },
  {
    heading: "Project",
    links: [
      internal("/about", "About"),
      external("https://github.com/Kelly-Buabeng/FYP-26-POTHOLE-DETECTION", "Backend source"),
      external("https://github.com/Kelly-Buabeng/dummy-fyp-frontend", "Frontend source"),
    ],
  },
  {
    heading: "API",
    links: [
      external("https://web-production-0431d.up.railway.app/docs", "API reference"),
      external("https://web-production-0431d.up.railway.app/health", "Health status"),
      external("https://github.com/Kelly-Buabeng/FYP-26-POTHOLE-DETECTION/issues", "Report an issue"),
    ],
  },
];

export function Footer() {
  const { status, message } = useHealthStatus();

  return (
    <footer className="border-t border-border bg-secondary py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-7 border-b border-border pb-9 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
              <img src="/assets/img/favicon-32.png" width={24} height={24} alt="" className="rounded-[7px]" />
              RoadGuard AI
            </Link>
            <p className="mt-3 max-w-[32ch] text-[13px] text-muted-foreground">
              AI-powered pothole detection and reporting, built as a final-year engineering project for
              Ghana's road network.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h5 className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.heading}
              </h5>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.kind === "internal" ? (
                      <Link to={link.to} className="text-[13.5px] text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-[12.5px] text-muted-foreground">
          <span>
            &copy; {new Date().getFullYear()} RoadGuard AI · FYP-26 Pothole Detection
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                "size-[7px] rounded-full bg-muted-foreground",
                status === "online" && "bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]",
                status === "degraded" && "bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.2)]",
                status === "offline" && "bg-destructive shadow-[0_0_0_3px_rgba(255,59,48,0.2)]"
              )}
            />
            {message}
          </span>
        </div>
      </div>
    </footer>
  );
}
