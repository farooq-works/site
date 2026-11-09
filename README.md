# MFD Solutions

Responsive Vue 3 portfolio built with Vite and Tailwind CSS.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Edit website content

Select **Login to edit website** in the lower-left corner and enter any non-empty username and password to open the visual content editor. This is a demo-only client-side gate, not real authentication; it does not secure the editor or website content. From the editor you can update section text, create or remove list elements, add or delete sections, and reorder sections. Changes are saved to this browser's local storage. Use **Export** to download a JSON backup or **Import** to restore one.

The About section uses the local portrait at `src/assets/images/MF.jpg`. Existing saved content that still references the original default remote portrait is migrated to this image when loaded.

The contact form opens the visitor's email application with the message addressed to the configured MFD Solutions email address. Newsletter submissions currently show an on-page confirmation and do not connect to a mailing-list service.
