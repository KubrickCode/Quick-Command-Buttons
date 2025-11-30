import { ChevronDown, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "~/core";
import { cn } from "~/core/shadcn/utils";

import { CODICONS } from "../data/codicons";
import { VSCodeIcon } from "../utils/parse-vscode-icon-name";

type IconPickerProps = {
  className?: string;
  onChange: (iconName: string | undefined) => void;
  value?: string;
};

const ICONS_PER_PAGE = 100;
const GRID_COLUMNS = 8;

export const IconPicker = ({ className, onChange, value }: IconPickerProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!searchQuery) {
      return CODICONS;
    }
    const query = searchQuery.toLowerCase();
    return CODICONS.filter((icon) => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const visibleIcons = useMemo(() => {
    if (showAll || searchQuery) {
      return filteredIcons;
    }
    return filteredIcons.slice(0, ICONS_PER_PAGE);
  }, [filteredIcons, showAll, searchQuery]);

  const hasMore = !showAll && !searchQuery && filteredIcons.length > ICONS_PER_PAGE;

  const handleIconClick = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery("");
    setShowAll(false);
  };

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleClearIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t("iconPicker.openPicker")}
          className={cn(
            "flex h-full items-center gap-1 px-2 text-sm rounded-l-[5px]",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors cursor-pointer shrink-0 border-r border-input",
            className
          )}
          tabIndex={-1}
          type="button"
        >
          {value ? (
            <VSCodeIcon className="text-base" name={value} />
          ) : (
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{t("iconPicker.label")}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3" data-testid="icon-picker-popover">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("iconPicker.searchPlaceholder")}
              value={searchQuery}
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-md border border-border">
            <div
              className="grid gap-1 p-2"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
              }}
            >
              {visibleIcons.map((iconName) => (
                <button
                  aria-label={t("iconPicker.selectIcon", { name: iconName })}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-sm",
                    "cursor-pointer transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === iconName && "bg-accent text-accent-foreground"
                  )}
                  data-testid="icon-grid-button"
                  key={iconName}
                  onClick={() => handleIconClick(iconName)}
                  title={iconName}
                  type="button"
                >
                  <VSCodeIcon className="text-base" name={iconName} />
                </button>
              ))}
            </div>

            {visibleIcons.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("iconPicker.noIconsFound")}
              </div>
            )}

            {hasMore && (
              <div className="border-t border-border p-2">
                <Button
                  className="w-full"
                  onClick={handleShowMore}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("iconPicker.showAll", { count: filteredIcons.length })}
                </Button>
              </div>
            )}
          </div>

          {value && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("iconPicker.selected")}: <span className="font-mono">{value}</span>
              </span>
              <button
                className="text-muted-foreground hover:text-foreground underline"
                onClick={handleClearIcon}
                type="button"
              >
                {t("iconPicker.clear")}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
