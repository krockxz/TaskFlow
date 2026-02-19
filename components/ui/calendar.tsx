"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-md border bg-background p-3", className)}
      classNames={{
        root: "rdp-root",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        month_caption_label: "text-sm font-medium text-foreground",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
        ),
        button_next: cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-30"
        ),
        month_grid: "w-full border-collapse space-x-1 space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-outside].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0",
          "hover:bg-accent hover:text-accent-foreground",
          "[&.day-selected]:bg-primary [&.day-selected]:text-primary-foreground [&.day-selected]:hover:bg-primary [&.day-selected]:hover:text-primary-foreground [&.day-selected]:focus-visible:bg-primary [&.day-selected]:focus-visible:text-primary-foreground",
          "[&.day-today]:bg-accent [&.day-today]:text-accent-foreground [&.day-today]:hover:bg-accent [&.day-today]:hover:text-accent-foreground [&.day-today]:focus-visible:bg-accent [&.day-today]:focus-visible:text-accent-foreground",
          "[&.day-outside]:text-muted-foreground [&.day-outside]:opacity-50 [&.day-outside]:hover:bg-accent/50 [&.day-outside]:hover:text-accent-foreground"
        ),
        range_start: "day-range-start rounded-l-md",
        range_end: "day-range-end rounded-r-md",
        selected: "day-selected bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "day-today bg-accent text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50 hover:bg-accent/50 hover:text-accent-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
