# Admin car photos not showing in the app

## How photos work

1. Admin uploads in **Car inventory** → file saved as `public/images/cars/{id}.jpg` (or `.png`, etc.)
2. Mobile API returns `imageUrl`: `/images/cars/2.png`
3. App loads: `https://uto.on-forge.com/images/cars/2.png`

## Checklist

### 1. App must use Forge (not localhost)

In `src/config/api.ts`:

```ts
export const USE_FORGE_IN_DEV = true;
```

Reload Metro (**r**) or rebuild.

### 2. Vehicle must be **Available**

The mobile catalog only lists available cars. If status is not Available, the car (and photo) will not appear in the app.

### 3. Reload the app after code changes

Press **r** in Metro. The red `syncFavorites` error should be gone after the latest update.

### 4. Forge deploys wipe uploads (common)

Photos are stored under `public/images/cars/` inside each **release** folder. A new deploy can leave the new release without your uploaded files.

**Fix on Forge** — add to your site **Deploy script** (before `php bin/console`):

```bash
mkdir -p $FORGE_SITE/storage/car-photos
if [ ! -e public/images/cars ]; then
  mkdir -p public/images
  ln -nfs ../../storage/car-photos public/images/cars
fi
```

In Forge **Environment**, add:

```
CAR_PHOTOS_STORAGE_DIR=/home/forge/uto.on-forge.com/storage/car-photos
```

(Use your real site path from Forge → Site → Meta.)

Redeploy, then **re-upload** the photo once in admin (or copy files into `storage/car-photos/`).

### 5. Test the image URL in a browser

Open:

`https://uto.on-forge.com/images/cars/2.png`

(replace `2` with your car id). If this 404s, the app cannot show it either.

### 6. Default SVG placeholders

Cars without an uploaded photo use `.svg` type images. The app shows a **text placeholder** instead (React Native does not render SVG in `Image`). Upload a **JPG/PNG** photo in admin for that vehicle.
