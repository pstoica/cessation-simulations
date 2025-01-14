import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  id?: string;
  showMarks?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      id,
      min = 0,
      max = 100,
      step = 1,
      showMarks = true,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const marks = showMarks ? [min, (min + max) / 2, max] : [];
    const thumbWidth = 16; // w-4 = 16px
    const snapThreshold = 4; // much smaller threshold - 2% of the track width

    const handleTrackClick = (event: React.MouseEvent) => {
      const track = event.currentTarget;
      const rect = track.getBoundingClientRect();

      // Account for the padding
      const trackWidth = rect.width;
      const clickX = event.clientX - rect.left;
      const percent = (clickX / trackWidth) * 100;

      // Find if we're close to any mark
      const range = max - min;
      let targetValue = (percent * range) / 100 + min;

      // Check each mark's position
      for (const mark of marks) {
        const markPercent = ((mark - min) / range) * 100;
        const adjustedMarkPercent =
          (markPercent * (100 - thumbWidth / 10)) / 100 + thumbWidth / 20;

        // If we clicked close to a mark, snap to it
        if (Math.abs(percent - adjustedMarkPercent) < snapThreshold) {
          targetValue = mark;
          break;
        }
      }

      onValueChange?.([targetValue]);
    };

    return (
      <div className="relative py-1">
        {/* Track marks */}
        {showMarks &&
          marks.map((value) => {
            const range = max - min;
            const rawPercent = ((value - min) / range) * 100;
            const adjustedPercent =
              (rawPercent * (100 - thumbWidth / 10)) / 100 + thumbWidth / 20;

            return (
              <div
                key={value}
                className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700 cursor-pointer hover:bg-pink-500"
                style={{ left: `${adjustedPercent}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange?.([value]);
                }}
              />
            );
          })}

        <div className="-mx-2">
          <SliderPrimitive.Root
            ref={ref}
            min={min}
            max={max}
            step={step}
            onValueChange={onValueChange}
            className={cn(
              "relative flex w-full touch-none select-none items-center px-2",
              className
            )}
            {...props}
          >
            <SliderPrimitive.Track
              className="relative h-6 w-full grow cursor-pointer"
              onClick={handleTrackClick}
            >
              {/* Visual track */}
              <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800">
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-pink-500" />
              </div>
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              id={id}
              className="relative block h-4 w-4 cursor-pointer rounded-full border border-pink-500/50 bg-white dark:bg-neutral-950 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 disabled:pointer-events-none disabled:opacity-50"
            />
          </SliderPrimitive.Root>
        </div>
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
