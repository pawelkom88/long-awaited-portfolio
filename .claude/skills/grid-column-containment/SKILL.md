---
name: grid-column-containment
description: Use minmax(0, 1fr) for grid columns when children overflow.
category: frontend
---

When a grid container has children with percentage widths that exceed 100%, those children can expand 
grid tracks beyond the intended size. Prevent this with `grid-template-columns: minmax(0, 1fr)`.

The `minmax(0, 1fr)` constraint stops overflow from feeding back into track sizing: the 0 minimum allows 
shrinking below content size, and 1fr fills remaining space.

Example: `.magic { display: grid; grid-template-columns: minmax(0, 1fr); }` keeps 
`.stage { width: 170%; }` from expanding the grid past its container.

Without this, the overflowed child expands the column, which expands the grid, breaking intended layout.