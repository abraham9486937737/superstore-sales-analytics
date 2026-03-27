# Lessons Learned: React Application Debugging (SuperStore Analytics)

## What Went Wrong

1. **Missing Data File in Public Directory**
   - The React app tried to fetch `SuperStoreOrders_SuperStoreOrders.csv` from the public directory.
   - The file was only present in the project root, not in `src/frontend/public/`, so the app could not load data and showed a blank screen.

2. **JavaScript Runtime Error (Missing Icon Imports)**
   - The `ExportToolbar.jsx` component used `<Moon />` and `<Sun />` icons but did not import them from `lucide-react`.
   - This caused a `ReferenceError: Moon is not defined`, which broke the React rendering and caused a blank screen.

---

## How We Fixed It

- **Copied the CSV file** to `src/frontend/public/` so the React app could access it via HTTP fetch.
- **Added missing imports** for `Moon` and `Sun` in `ExportToolbar.jsx` to fix the runtime error.

---

## Lessons & Best Practices

1. **Always Check Data File Paths**
   - For React/Vite apps, static files (like CSVs) must be in the `public` directory to be accessible via HTTP fetch.
   - If data doesn’t load, check the browser network tab for 404s or failed fetches.

2. **Check the Browser Console for Errors**
   - A blank screen often means a JavaScript error. Always check the browser console for red error messages.
   - Fixing the first error usually restores the app.

3. **Import All Used Components/Icons**
   - If you use a component or icon, make sure it’s imported at the top of the file.
   - Missing imports will cause runtime errors and break the app.

4. **Use Debug Logging for Data Issues**
   - Add temporary `console.log` statements to inspect data loading and normalization.
   - This helps quickly identify if data is being loaded and parsed as expected.

5. **Restart the Dev Server After Fixes**
   - After moving files or fixing code, always restart the development server to ensure changes take effect.

---

## Debugging Workflow for Future Issues

1. **Check the browser console for errors.**
2. **Check the network tab for failed data requests.**
3. **Ensure all files are in the correct locations.**
4. **Make sure all imports are present for used components/icons.**
5. **Use debug logs if data is not loading as expected.**

---

*Documented on: 2026-03-26*
