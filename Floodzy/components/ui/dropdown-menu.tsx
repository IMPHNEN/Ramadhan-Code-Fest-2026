'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent focus:bg-gradient-to-r focus:from-accent/80 focus:to-accent data-[state=open]:bg-gradient-to-r data-[state=open]:from-accent data-[state=open]:to-accent/80 hover:shadow-sm focus:ring-2 focus:ring-primary/20',
      inset && 'pl-9',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-1.5 text-popover-foreground shadow-2xl ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-1.5 text-popover-foreground shadow-2xl ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-96 data-[state=open]:zoom-in-96 data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3 data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
  }
>(({ className, inset, variant = 'default', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:bg-gradient-to-r focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group',
      variant === 'default' &&
        'hover:bg-gradient-to-r hover:from-accent/70 hover:to-accent focus:from-accent focus:to-accent/80 hover:shadow-sm focus:ring-2 focus:ring-primary/20',
      variant === 'destructive' &&
        'text-destructive hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 focus:bg-gradient-to-r focus:from-destructive/15 focus:to-destructive/10 hover:text-destructive focus:text-destructive',
      inset && 'pl-9',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-3 rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/70 hover:to-accent focus:bg-gradient-to-r focus:from-accent focus:to-accent/80 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:shadow-sm focus:ring-2 focus:ring-primary/20',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary shadow-sm">
          <Check className="h-3 w-3 text-primary-foreground font-medium" />
        </div>
      </DropdownMenuPrimitive.ItemIndicator>
      <div
        className={cn(
          'h-4 w-4 rounded-sm border-2 border-muted-foreground/30 transition-all duration-200',
          checked && 'opacity-0',
        )}
      />
    </span>
    <div className="flex-1 truncate">{children}</div>
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-3 rounded-lg py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/70 hover:to-accent focus:bg-gradient-to-r focus:from-accent focus:to-accent/80 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:shadow-sm focus:ring-2 focus:ring-primary/20',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="flex h-4 w-4 items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
        </div>
      </DropdownMenuPrimitive.ItemIndicator>
      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
    </span>
    <div className="flex-1 truncate">{children}</div>
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
      inset && 'pl-9',
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      '-mx-1 my-2 h-px bg-gradient-to-r from-transparent via-muted to-transparent',
      className,
    )}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-wider font-medium opacity-60 bg-muted/50 px-1.5 py-0.5 rounded border',
        className,
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
