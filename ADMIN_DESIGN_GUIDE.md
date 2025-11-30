# Admin Design Guide

This guide outlines the standard structure and design patterns for the Admin Dashboard pages to ensure consistency across the application.

## Page Structure

All admin pages should follow this basic structure:

```tsx
export default async function AdminPage() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Page description goes here
          </p>
        </div>
        {/* Optional: Primary Action Button */}
        <Button>Action</Button>
      </div>

      {/* Optional: Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* ... Stats Cards ... */}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList className="grid w-full grid-cols-N"> {/* N = number of tabs */}
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>

        <TabsContent value="tab1" className="space-y-6">
          {/* Tab 1 Content */}
        </TabsContent>

        <TabsContent value="tab2" className="space-y-6">
          {/* Tab 2 Content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## Key Components

### 1. Layout Container
- **Classes**: `flex flex-col gap-6 p-6 bg-gray-50 min-h-screen`
- **Purpose**: Provides consistent padding, background color, and vertical spacing.

### 2. Header Section
- **Container**: `flex items-center justify-between`
- **Title**: `text-2xl font-bold text-gray-900`
- **Description**: `text-gray-600 mt-1 text-sm`
- **Action Button**: Placed on the right side if needed.

### 3. Stats Grid (Optional)
- **Container**: `grid gap-4 md:grid-cols-4` (adjust cols as needed)
- **Usage**: Display high-level metrics relevant to the page context.

### 4. Tabs Navigation
- **Component**: `Tabs` from `@/components/ui/tabs`
- **TabsList**: `grid w-full grid-cols-N` (where N is number of tabs)
- **TabsContent**: `space-y-6` for consistent vertical spacing within tabs.
- **Usage**: Organize complex page content into logical sections.

## Implementation Checklist

- [ ] Wrap page content in the standard layout container.
- [ ] Implement the standard header with title and description.
- [ ] Use `Tabs` to organize content if there are multiple distinct sections.
- [ ] Ensure background colors and spacing match the design tokens (`bg-gray-50`, `gap-6`, `p-6`).
