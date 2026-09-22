import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/live-demo", label: "Live Demo" },
  { to: "/heatmap", label: "Heatmap" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

function BrandMark() {
  return (
    <img
      src="/assets/img/favicon-32.png"
      width={24}
      height={24}
      alt=""
      className="rounded-[7px]"
    />
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center border-b border-transparent bg-white/72 backdrop-blur-xl backdrop-saturate-150 transition-colors",
        isScrolled && "border-border bg-white/86"
      )}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
          <BrandMark />
          RoadGuard AI
        </Link>

        <ul className="hidden items-center gap-7.5 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "text-foreground"
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
            <Link to="/live-demo">Try the demo</Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="right" showCloseButton className="w-full sm:max-w-sm">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="flex flex-col gap-1 px-4 pt-14">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "border-b border-border py-3.5 text-xl font-semibold",
                          isActive && "text-foreground"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild size="lg" className="mt-5 w-full">
                    <Link to="/live-demo">Try the demo</Link>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4.5" />
            </Button>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
