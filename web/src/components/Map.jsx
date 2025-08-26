"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Square, Circle, Pentagon, Trash2 } from "lucide-react";

export default function Map({ onAreaSelected, analysisResult }) {
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const [mapState, setMapState] = useState({
    center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    zoom: 13,
    isDragging: false,
    dragStart: null,
  });

  const [drawingMode, setDrawingMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [drawnShape, setDrawnShape] = useState(null);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = useCallback((lat, lng, zoom, mapWidth, mapHeight) => {
    const scale = Math.pow(2, zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const pixelX = ((lng + 180) / 360) * worldWidth;
    const pixelY =
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
      worldHeight;

    return {
      x: pixelX - (worldWidth - mapWidth) / 2,
      y: pixelY - (worldHeight - mapHeight) / 2,
    };
  }, []);

  // Convert pixel coordinates to lat/lng
  const pixelToLatLng = useCallback((x, y, zoom, mapWidth, mapHeight) => {
    const scale = Math.pow(2, zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const worldX = x + (worldWidth - mapWidth) / 2;
    const worldY = y + (worldHeight - mapHeight) / 2;

    const lng = (worldX / worldWidth) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * worldY) / worldHeight;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return { lat, lng };
  }, []);

  // Get OSM tile URL
  const getTileUrl = (x, y, z) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  // Load map tiles
  useEffect(() => {
    if (!mapRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = mapRef.current.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate tile coordinates
    const zoom = Math.floor(mapState.zoom);
    const scale = Math.pow(2, zoom);
    const tileSize = 256;

    const centerTileX = Math.floor(((mapState.center.lng + 180) / 360) * scale);
    const centerTileY = Math.floor(
      ((1 -
        Math.log(
          Math.tan((mapState.center.lat * Math.PI) / 180) +
            1 / Math.cos((mapState.center.lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
        scale,
    );

    const tilesX = Math.ceil(canvas.width / tileSize) + 1;
    const tilesY = Math.ceil(canvas.height / tileSize) + 1;

    const startTileX = centerTileX - Math.floor(tilesX / 2);
    const startTileY = centerTileY - Math.floor(tilesY / 2);

    // Load and draw tiles
    let loadedTiles = 0;
    const totalTiles = tilesX * tilesY;

    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const tileX = startTileX + x;
        const tileY = startTileY + y;

        if (tileX >= 0 && tileY >= 0 && tileX < scale && tileY < scale) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const drawX =
              x * tileSize -
              ((centerTileX - startTileX) * tileSize - canvas.width / 2);
            const drawY =
              y * tileSize -
              ((centerTileY - startTileY) * tileSize - canvas.height / 2);

            ctx.drawImage(img, drawX, drawY, tileSize, tileSize);
            loadedTiles++;

            // Draw shape overlay after tiles are loaded
            if (loadedTiles === totalTiles || loadedTiles > totalTiles * 0.8) {
              drawOverlays();
            }
          };
          img.onerror = () => {
            loadedTiles++;
            if (loadedTiles >= totalTiles * 0.8) {
              drawOverlays();
            }
          };
          img.src = getTileUrl(tileX, tileY, zoom);
        }
      }
    }
  }, [mapState.center, mapState.zoom]);

  // Draw both completed shapes and current drawing
  const drawOverlays = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Draw completed shape
    if (drawnShape) {
      drawShape(ctx, drawnShape, "#16a34a", "rgba(34, 197, 94, 0.3)", 2);
    }

    // Draw current drawing preview
    if (isDrawing && currentPath.length > 0) {
      drawCurrentDrawing(ctx);
    }
  }, [drawnShape, isDrawing, currentPath, mapState.zoom, latLngToPixel]);

  // Draw a shape on the canvas
  const drawShape = (ctx, shape, strokeColor, fillColor, lineWidth) => {
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = lineWidth;

    if (shape.type === "polygon" || shape.type === "rectangle") {
      ctx.beginPath();
      shape.coordinates.forEach((coord, index) => {
        const pixel = latLngToPixel(
          coord.lat,
          coord.lng,
          mapState.zoom,
          ctx.canvas.width,
          ctx.canvas.height,
        );
        if (index === 0) {
          ctx.moveTo(pixel.x, pixel.y);
        } else {
          ctx.lineTo(pixel.x, pixel.y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape.type === "circle") {
      const center = latLngToPixel(
        shape.coordinates.lat,
        shape.coordinates.lng,
        mapState.zoom,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      const radius =
        ((shape.coordinates.radius /
          (111320 * Math.cos((shape.coordinates.lat * Math.PI) / 180))) *
          Math.pow(2, mapState.zoom) *
          256) /
        360;

      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  // Draw current drawing preview
  const drawCurrentDrawing = (ctx) => {
    if (currentPath.length === 0) return;

    ctx.strokeStyle = "#059669";
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed line for preview

    if (drawingMode === "polygon") {
      if (currentPath.length > 1) {
        ctx.beginPath();
        currentPath.forEach((coord, index) => {
          const pixel = latLngToPixel(
            coord.lat,
            coord.lng,
            mapState.zoom,
            ctx.canvas.width,
            ctx.canvas.height,
          );
          if (index === 0) {
            ctx.moveTo(pixel.x, pixel.y);
          } else {
            ctx.lineTo(pixel.x, pixel.y);
          }
        });
        ctx.stroke();
      }
    } else if (drawingMode === "rectangle" && currentPath.length === 2) {
      const [start, end] = currentPath;
      const startPixel = latLngToPixel(
        start.lat,
        start.lng,
        mapState.zoom,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      const endPixel = latLngToPixel(
        end.lat,
        end.lng,
        mapState.zoom,
        ctx.canvas.width,
        ctx.canvas.height,
      );

      const width = endPixel.x - startPixel.x;
      const height = endPixel.y - startPixel.y;

      ctx.strokeRect(startPixel.x, startPixel.y, width, height);
      ctx.fillRect(startPixel.x, startPixel.y, width, height);
    } else if (drawingMode === "circle" && currentPath.length === 2) {
      const [center, edge] = currentPath;
      const centerPixel = latLngToPixel(
        center.lat,
        center.lng,
        mapState.zoom,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      const edgePixel = latLngToPixel(
        edge.lat,
        edge.lng,
        mapState.zoom,
        ctx.canvas.width,
        ctx.canvas.height,
      );

      const radius = Math.sqrt(
        Math.pow(edgePixel.x - centerPixel.x, 2) +
          Math.pow(edgePixel.y - centerPixel.y, 2),
      );

      ctx.beginPath();
      ctx.arc(centerPixel.x, centerPixel.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.setLineDash([]); // Reset line dash
  };

  // Redraw overlays when needed
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      drawOverlays();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [drawOverlays]);

  // Handle scroll wheel zoom with smooth interpolation
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3; // Smaller increments for smoother zoom
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(18, prev.zoom + delta)),
    }));
  };

  // Handle mouse events for both panning and drawing
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const latLng = pixelToLatLng(x, y, mapState.zoom, rect.width, rect.height);

    if (drawingMode) {
      // Drawing mode
      setIsDrawing(true);
      setCurrentPath([latLng]);
    } else {
      // Panning mode with smooth dragging
      setMapState((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: e.clientX,
          y: e.clientY,
          center: prev.center,
          timestamp: Date.now(),
        },
      }));
    }
  };

  const handleMouseMove = (e) => {
    if (mapState.isDragging && !drawingMode) {
      // Smooth panning with improved calculations
      const deltaX = e.clientX - mapState.dragStart.x;
      const deltaY = e.clientY - mapState.dragStart.y;

      const scale = Math.pow(2, mapState.zoom);
      const pixelsPerDegree = (256 * scale) / 360;

      // Apply smoothing factor for more responsive movement
      const smoothingFactor = 1.2;

      const newCenter = {
        lng:
          mapState.dragStart.center.lng -
          (deltaX / pixelsPerDegree) * smoothingFactor,
        lat:
          mapState.dragStart.center.lat +
          (deltaY / pixelsPerDegree) *
            Math.cos((mapState.dragStart.center.lat * Math.PI) / 180) *
            smoothingFactor,
      };

      setMapState((prev) => ({
        ...prev,
        center: newCenter,
      }));
    } else if (isDrawing && drawingMode) {
      // Drawing with optimized coordinate conversion
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const latLng = pixelToLatLng(
        x,
        y,
        mapState.zoom,
        rect.width,
        rect.height,
      );

      if (drawingMode === "polygon") {
        // Throttle polygon point addition for smoother drawing
        setCurrentPath((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (!lastPoint) return [latLng];

          const distance = Math.sqrt(
            Math.pow(lastPoint.lat - latLng.lat, 2) +
              Math.pow(lastPoint.lng - latLng.lng, 2),
          );

          // Only add point if it's far enough from the last one
          if (distance > 0.0001) {
            return [...prev, latLng];
          }
          return prev;
        });
      } else {
        setCurrentPath((prev) => [prev[0], latLng]);
      }
    }
  };

  const handleMouseUp = () => {
    if (mapState.isDragging) {
      // End panning
      setMapState((prev) => ({
        ...prev,
        isDragging: false,
        dragStart: null,
      }));
    } else if (isDrawing && currentPath.length > 0) {
      // End drawing with minimum shape requirements
      let shape;
      let area;

      if (drawingMode === "polygon" && currentPath.length >= 3) {
        shape = {
          type: "polygon",
          coordinates: currentPath,
        };
        area = calculatePolygonArea(currentPath);
      } else if (drawingMode === "rectangle" && currentPath.length === 2) {
        const [start, end] = currentPath;
        const coordinates = [
          start,
          { lat: start.lat, lng: end.lng },
          end,
          { lat: end.lat, lng: start.lng },
        ];
        shape = {
          type: "rectangle",
          coordinates,
        };
        area = calculatePolygonArea(coordinates);
      } else if (drawingMode === "circle" && currentPath.length === 2) {
        const [center, edge] = currentPath;
        const radius = calculateDistance(center, edge);
        if (radius > 10) {
          // Minimum radius of 10 meters
          shape = {
            type: "circle",
            coordinates: { ...center, radius },
          };
          area = Math.PI * radius * radius;
        }
      }

      if (shape) {
        setDrawnShape(shape);
        setIsDrawing(false);
        setCurrentPath([]);
        setDrawingMode(null);

        onAreaSelected({
          ...shape,
          area,
        });
      } else {
        // Reset if shape is too small or invalid
        setIsDrawing(false);
        setCurrentPath([]);
      }
    }
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate polygon area using Shoelace formula
  const calculatePolygonArea = (coordinates) => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].lat * coordinates[j].lng;
      area -= coordinates[j].lat * coordinates[i].lng;
    }
    return (Math.abs(area) * 6378137 * 6378137) / 2; // Convert to square meters
  };

  const clearDrawing = () => {
    setDrawnShape(null);
    setCurrentPath([]);
    setIsDrawing(false);
    setDrawingMode(null);
    onAreaSelected(null);
  };

  const handleZoom = (delta) => {
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(18, prev.zoom + delta)),
    }));
  };

  const getCursor = () => {
    if (drawingMode) return "crosshair";
    if (mapState.isDragging) return "grabbing";
    return "grab";
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full relative bg-gray-200 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ cursor: getCursor() }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* Drawing Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-sm font-medium text-gray-700 px-2">
          Drawing Tools
        </div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setDrawingMode("polygon")}
            className={`px-3 py-2 text-sm rounded flex items-center space-x-2 ${
              drawingMode === "polygon"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Pentagon className="h-4 w-4" />
            <span>Polygon</span>
          </button>
          <button
            onClick={() => setDrawingMode("circle")}
            className={`px-3 py-2 text-sm rounded flex items-center space-x-2 ${
              drawingMode === "circle"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Circle className="h-4 w-4" />
            <span>Circle</span>
          </button>
          <button
            onClick={() => setDrawingMode("rectangle")}
            className={`px-3 py-2 text-sm rounded flex items-center space-x-2 ${
              drawingMode === "rectangle"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Square className="h-4 w-4" />
            <span>Rectangle</span>
          </button>
          {drawnShape && (
            <button
              onClick={clearDrawing}
              className="px-3 py-2 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-1 flex flex-col">
        <button
          onClick={() => handleZoom(1)}
          className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-100 rounded"
        >
          −
        </button>
      </div>

      {/* Instructions */}
      {!drawnShape && !drawingMode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="text-sm text-gray-600">
            <strong>How to use:</strong>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Scroll to zoom, drag to pan</li>
              <li>Choose a drawing tool above</li>
              <li>Click and drag to draw an area</li>
              <li>Click "Analyze Green Space" to get results</li>
            </ol>
            <div className="mt-2 text-xs text-gray-500">
              Powered by OpenStreetMap
            </div>
          </div>
        </div>
      )}

      {/* Drawing Instructions */}
      {drawingMode && (
        <div className="absolute bottom-4 left-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="text-sm text-green-800">
            <strong>Drawing {drawingMode}:</strong>
            <p className="mt-1">
              {drawingMode === "polygon" &&
                "Click to add points, release to finish"}
              {drawingMode === "circle" && "Click center, drag to set radius"}
              {drawingMode === "rectangle" &&
                "Click corner, drag to opposite corner"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
