# 🔍 NOTION EMBED ANALYSIS REPORT
## "Media Not Available" - 403 Error Investigation

### 📊 **PROBLEM SUMMARY**
- **Issue**: Media displays correctly on web but shows "Sorry, you cannot access this page" with "Error code: (403)" when embedded in Notion
- **Error Type**: HTTP 403 Forbidden
- **Affected Content**: Canva embeds, some external images, certain media sources
- **Working Content**: Direct image uploads, some external links

---

## 🔬 **ROOT CAUSE ANALYSIS**

### 1. **Content Security Policy (CSP) Restrictions**
Notion implements strict CSP rules that block certain external domains and resource types when content is embedded in iframes.

**Evidence from your image:**
- Top row cards (working): Likely direct image uploads or allowed domains
- Bottom row cards (403 errors): Likely Canva embeds or blocked external domains

### 2. **Iframe Sandbox Restrictions**
When Notion embeds your widget, it places it in an iframe with specific sandbox attributes that restrict:
- Network requests to certain domains
- Loading of external iframes (like Canva embeds)
- Cross-origin resource sharing

### 3. **Canva Embed Limitations**
Canva's embed URLs (`https://www.canva.com/design/.../view?embed`) are designed for direct embedding, not for embedding within another iframe (Notion → Your Widget → Canva).

---

## 🧪 **DETAILED TECHNICAL ANALYSIS**

### **Current URL Patterns Being Fetched:**

Based on your codebase, here are the URL patterns your widget is trying to load:

#### ✅ **Working URLs (Likely):**
```
https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500&h=500&fit=crop
https://images.unsplash.com/photo-1611605698335-8b1569810432?w=500&h=500&fit=crop
```

#### ❌ **Blocked URLs (403 Errors):**
```
https://www.canva.com/design/DAGiPMnfawk/view?embed
https://www.canva.com/design/[DESIGN_ID]/view?embed
```

### **URL Analysis by Source Type:**

| Source Type | URL Pattern | Notion Compatibility | Status |
|-------------|-------------|---------------------|---------|
| `attachment` | Direct file URLs | ✅ Usually works | Working |
| `link` | External image URLs | ⚠️ Depends on domain | Mixed |
| `canva` (embed) | `canva.com/design/.../view?embed` | ❌ Blocked by CSP | 403 Error |
| `canva` (direct) | Direct image URLs | ✅ Usually works | Working |

---

## 🔍 **DEBUGGING STEPS IMPLEMENTED**

### 1. **Enhanced Debug Component**
I've updated the `DebugInfo` component to show:
- Complete URL analysis for each media item
- Domain and protocol information
- Source type identification
- CSP blocking warnings for Canva embeds

### 2. **Console Logging**
Added detailed logging in:
- API routes (`/app/api/widgets/[slug]/data/route.ts`)
- Frontend components (`/app/(public)/w/[slug]/page.tsx`)

### 3. **Error Detection**
Enhanced error handling to identify:
- Which specific URLs are failing
- What source types are problematic
- Domain-level blocking patterns

---

## 🛠️ **IMMEDIATE SOLUTIONS**

### **Solution 1: Replace Canva Embeds with Direct Images**
```typescript
// Instead of Canva embed URLs:
https://www.canva.com/design/DAGiPMnfawk/view?embed

// Use direct image URLs:
https://media.canva.com/design/DAGiPMnfawk/image/0/0/800x600.png
```

### **Solution 2: Implement Fallback Images**
```typescript
// Add fallback for blocked content
const getSafeImageUrl = (image: NotionImage) => {
  if (image.source === 'canva' && image.isEmbed) {
    // Try to convert to direct image URL
    return convertCanvaToDirectImage(image.originalUrl);
  }
  return image.url;
};
```

### **Solution 3: Use Proxy Server**
```typescript
// Route Canva embeds through your own server
const proxyUrl = `/api/proxy/canva?url=${encodeURIComponent(canvaUrl)}`;
```

---

## 📋 **TESTING CHECKLIST**

### **In Notion Environment:**
1. ✅ Open browser developer tools (F12)
2. ✅ Check Console tab for CSP errors
3. ✅ Look for "Blocked by Content Security Policy" messages
4. ✅ Check Network tab for failed requests
5. ✅ Note which specific URLs return 403

### **Direct Testing:**
1. ✅ Try embedding a Canva URL directly in Notion (without your widget)
2. ✅ Test if `https://www.canva.com/design/.../view?embed` works in Notion
3. ✅ Compare working vs failing URLs

---

## 🎯 **RECOMMENDED FIXES**

### **Priority 1: Fix Canva Embeds**
```typescript
// Update convertCanvaUrlToImages function
function convertCanvaUrlToImages(canvaUrl: string): NotionImage[] {
  const designIdMatch = canvaUrl.match(/\/design\/([^\/]+)\//);
  
  if (designIdMatch) {
    const designId = designIdMatch[1];
    
    // Use direct image URLs instead of embeds
    return [{
      url: `https://media.canva.com/design/${designId}/image/0/0/800x600.png`,
      source: 'canva',
      originalUrl: canvaUrl,
      isDirectImage: true, // New flag
    }];
  }
  
  // Fallback to placeholder
  return [/* placeholder images */];
}
```

### **Priority 2: Add CSP-Safe Fallbacks**
```typescript
// In WidgetCard component
const getSafeMediaUrl = (media: NotionImage) => {
  // If it's a Canva embed, try direct image first
  if (media.source === 'canva' && media.isEmbed) {
    return convertToDirectImage(media.originalUrl);
  }
  
  // For other sources, return as-is
  return media.url;
};
```

### **Priority 3: Implement Error Boundaries**
```typescript
// Add error boundary for media loading
const MediaErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return fallback;
  }
  
  return children;
};
```

---

## 📊 **EXPECTED RESULTS AFTER FIXES**

### **Before Fixes:**
- ❌ Canva embeds: 403 Forbidden errors
- ⚠️ Some external images: Mixed results
- ✅ Direct uploads: Working

### **After Fixes:**
- ✅ Canva content: Direct image URLs (no embeds)
- ✅ External images: Fallback to safe alternatives
- ✅ Direct uploads: Still working
- ✅ All media: Consistent loading in Notion

---

## 🚀 **NEXT STEPS**

1. **Deploy the debug version** to see exact URLs being blocked
2. **Test in Notion** and check console for specific CSP errors
3. **Implement Canva direct image conversion**
4. **Add fallback mechanisms** for blocked content
5. **Test thoroughly** in both web and Notion environments

---

## 📞 **SUPPORT INFORMATION**

If you need to test specific URLs or need help implementing any of these solutions, the debug component will now show you exactly which URLs are being blocked and why.

**Key Files Modified:**
- `components/DebugInfo.tsx` - Enhanced debugging
- `app/(public)/w/[slug]/page.tsx` - Enabled debug mode
- `lib/notion.ts` - Ready for Canva URL conversion fixes

**Next Action:** Deploy this debug version and check the console output in Notion to identify the exact blocked URLs.
