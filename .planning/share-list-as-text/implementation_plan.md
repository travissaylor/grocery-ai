# Implementation Plan: Share List as Text

## Goal Description
Add the ability to share a grocery list as a formatted text string. The sharing feature will allow users to easily send their lists via text message, email, or copy them to the clipboard. The formatting should be clean and readable, indicating which items are checked and unchecked.

## User Interface & UX Decisions
1. **Share Button Location**: Add a "Share list" option in the `ListSwitcher` dropdown menu, right below "Duplicate list".
2. **Text Format**:
   - The list name should be the title.
   - Items should be listed with `[ ]` for unchecked and `[x]` for checked.
   - Optionally, items could be grouped by section (e.g., Produce, Dairy) if the developer wishes, but a simple flat list is also acceptable.
3. **Sharing Mechanism**:
   - Use the native Web Share API (`navigator.share`) if supported (mostly on mobile browsers).
   - Fallback to copying to clipboard (`navigator.clipboard.writeText`) if the Web Share API is not available or fails.
   - Show a temporary toast or alert confirming the action (e.g., "List copied to clipboard!").

## Proposed Changes

### 1. Update `lib/types.ts` (if needed)
*(No changes strictly required here unless defining specific share-related types, but good to review).*

### 2. Update `components/ListSwitcher.tsx`
#### [MODIFY] `components/ListSwitcher.tsx`
- **Props**: Add `onShareList: () => void;` to the `ListSwitcherProps` interface.
- **Dropdown Menu**: Add a new `<button>` inside the dropdown (below Duplicate list).
  - Icon: A share icon (e.g., an arrow pointing out of a box, or a branching share icon).
  - Label: "Share list".
  - onClick: Call `onShareList()` and close the dropdown.

### 3. Implement Sharing Logic in `app/page.tsx`
#### [MODIFY] `app/page.tsx`
- **Formatting Function**: Create a helper function `formatListForSharing(list: ShoppingList, items: GroceryItem[])` that returns a string.
  ```typescript
  const formatListForSharing = () => {
    if (!activeList) return "";
    let text = `Grocery List: ${activeList.name}\n\n`;
    
    // Group by section or just list them. A simple implementation:
    const unchecked = items.filter(i => !i.checked);
    const checked = items.filter(i => i.checked);
    
    if (unchecked.length > 0) {
      text += "To Buy:\n";
      unchecked.forEach(item => text += `- [ ] ${item.name}\n`);
      text += "\n";
    }
    
    if (checked.length > 0) {
      text += "Got It:\n";
      checked.forEach(item => text += `- [x] ${item.name}\n`);
    }
    
    return text.trim();
  };
  ```
- **Share Handler**: Create a function `handleShareList()`.
  ```typescript
  const handleShareList = async () => {
    const text = formatListForSharing();
    const shareData = {
      title: activeList?.name || 'Grocery List',
      text: text,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        // Show a temporary success message/toast here
        alert("List copied to clipboard!"); // Replace with proper toast if available
      }
    } catch (error) {
      console.error("Error sharing list:", error);
    }
  };
  ```
- **Pass Prop**: Pass `onShareList={handleShareList}` to the `<ListSwitcher />` component.

### 4. Optional: Toast Notification
- If the app doesn't have a toast notification system, consider using a simple timeout-based state in `app/page.tsx` to render a small floating success message at the bottom of the screen instead of `alert()`, ensuring a premium feel.

## Verification Plan
### Manual Verification
1. **Browser Test (Desktop)**: Open the dropdown, click "Share list". It should copy the text to the clipboard and show a success message. Paste the clipboard into a text editor to verify formatting.
2. **Mobile Device / Simulator Test**: Use a mobile browser (Safari on iOS or Chrome on Android). Click "Share list". It should trigger the native OS share sheet.
3. **Empty List**: Try sharing an empty list. Ensure it handles it gracefully (e.g., just shares the title).
4. **Mixed State**: Share a list with both checked and unchecked items and verify they are correctly segregated and formatted with `[x]` and `[ ]`.
