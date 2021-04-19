# DayZMap
A browser map for vanilla DayZ Mod (ArmA II) with vehicle spawns etc.
Working example [here](https://www.perry-swift.de/dayz).

![](https://i.imgur.com/gzSdnTG.jpg)
![](https://i.imgur.com/mGFmJ1g.png)

# Building

### Requirements
* node with angular, leaflet, see `package.json`
* python to render the map tiles
* ArmA 3 Tools
* [ImageMagick](https://imagemagick.org/script/download.php) (linux via packet manager, windows via [MinGW](http://www.mingw.org/))
* [GDAL](https://gdal.org/index.html) (On Windows via [Anaconda](https://anaconda.org/))

### Steps
1. Run
```console
ng build --aot --prod --base-href=/dayz/ --deploy-url=http://www.example.com/
```
2. Copy to webserver

#### Rendering Map Tiles

##### Getting Satellite Map
1. Unpack `Arma 2/AddOns/Chernarus_Data_Layers.pbo` with your favorite pbo extractor
2. Convert tiles in `ca/chernarus/data/layers` from `.paa` to `.png`
   2.1. Get full path to `Pal2PacE.exe` from Arma 3 Tools and edit paths in `tools/create_tiles.sh` accordingly
   2.2. Run it, this should give you a single `map.png` with about 500 MB as output.

##### Getting Topography Map
You can skip some these steps marked as (optional) by grabbing the pre-rendered map at `tools\Chernarus.png`
1. (Optional) Export `Chernarus.emf` from Arma 2
   1.1. Start game as admin
   1.2. Press `left shift + numpad minus`, then release and type `topographz` (it uses QUERTZ layout, not QUERY)
   1.3. You should find `C:\chernarus.emf`
   1.4. Since Arma 3 there is also `ExportNoGrid`, you will have to play around with that
2. (Optional) Convert `.emf` to `.png` as [described here](https://community.bistudio.com/wiki/Making_Satellite_Texture_and_Mask).

##### Getting Tiles From Single Image
1. Run
  ```console
  python gdal2tiles.py -l -p raster -z 0-7 -w none map.png tiles
  ```
  and wait for it to finish. Here maximum zoom level is 7, you can increase, but it will increase render time and size.
2. You should have your finished map in the /tiles folder.
3. Copy the entire folder to some static url on your webserver.


# Hosting

### Requirements
* nginx/apache webserver
* around 1 GB for both topo and sat map
* map tiles

### Steps
2. Copy map tiles to your webserver (you can send me a message, I can upload them for you).
2. Edit `src/assets/config.json` to your needs.
3. Move angular build to your webserver.

## References
- [How to export Topography](http://killzonekid.com/arma-scripting-tutorials-how-to-export-topography/)
- [Mondkalb's Terrain Tutorial](https://community.bistudio.com/wiki/Mondkalb%27s_Terrain_Tutorial)
- [Making Satellite Texture and Mask](https://community.bistudio.com/wiki/Making_Satellite_Texture_and_Mask)
- [gdal2tiles.py](https://github.com/commenthol/gdal2tiles-leaflet)
