import satori from "satori";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import svg2img from "svg2img";
import sharp from "sharp";
import mongoose from "mongoose";
import OnchainTip from "../../../../../models/OnchainTip";
import connectToDatabase from "../../../../../libs/mongodb";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const fontPath = path.join(process.cwd(), "public", "Inter-SemiBold.ttf");
    const fontData = fs.readFileSync(fontPath);

        await connectToDatabase();
    let tipDoc = null;
    let objectId = null;
    try {
      objectId = new mongoose.Types.ObjectId(id);
      tipDoc = await OnchainTip.findOne({ _id: objectId }).lean();
    } catch (_) {
      // invalid id
    }
    const width = 600;
    const height = 400;
    const backgroundImg = `${baseURL}/images/background-tip.png`

    // Serve cached image if present
    if (tipDoc?.image) {
      try {
        const existing = tipDoc.image;
        const buffer = Buffer.isBuffer(existing)
          ? existing
          : existing?.buffer
            ? Buffer.from(existing.buffer)
            : null;
        if (buffer) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'max-age=10');
          res.send(buffer);
          return;
        }
      } catch (_) {
        // fall through to regeneration
      }
    }

    if (!tipDoc) {
      const svg = await satori(
        <div
          style={{
            width,
            height,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#0a021f',
          }}
        >
          <div style={{ color: '#ace', fontSize: 40, textAlign: 'center', whiteSpace: 'pre-wrap', padding: 12 }}>
          {`Impact 2.0\nMulti-Tip`}
          </div>
        </div>,
        { width, height, fonts: [{ data: fontData, name: 'Inter', style: 'normal', weight: 600 }] }
      );
      const svgBuffer = Buffer.from(svg);
      const convertSvgToPng = promisify(svg2img);
      const pngBuffer = await convertSvgToPng(svgBuffer, { format: 'png', width, height });
      const compressedBuffer = await sharp(pngBuffer).png({ quality: 50, compressionLevel: 9 }).toBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'max-age=10');
      res.send(compressedBuffer);
      return;
    }

    const cx = width / 2;
    const cy = height / 2;

    const tipperPfp = tipDoc.tipper_pfp;
    const receivers = Array.isArray(tipDoc.receiver) ? tipDoc.receiver : [];
    const sorted = receivers
      .map((r) => ({ pfp: r.pfp || "", amount: Number(r.amount || 0) }))
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const tips = Array.isArray(tipDoc.tip) ? tipDoc.tip : [];
    const tokenSymbol = tips[0]?.currency || '';
    let totalAmount = 0;
    for (const t of tips) totalAmount += Number(t?.amount || 0);
    const formatAmount = (n) => {
      if (n > 10) return Math.round(n).toString();
      if (n >= 1) return n.toFixed(2);
      return n.toFixed(4);
    };

    const creatorsCount = receivers.length;
    const creatorsLines = `${creatorsCount}\ncreators\n& curators\ntipped`;
    const amountLine = `${formatAmount(totalAmount)}`;
    const tokenLine = `$${tokenSymbol}`;

    const maxImages = 30;
    const imgNodes = sorted.slice(0, maxImages);
    const circleNodes = sorted.slice(maxImages);

    // Per-ring fixed sizes (px)
    const ringCapacities = [8, 8, 8];
    const ringRadii = [100, 150, 170];
    const ringSizes = [56, 44, 37];

    // Fixed size for outer blue circle ring
    const circleOuterRadius = Math.min(cx, cy) - 18;
    const outerCircleSize = 18;

    function distribute(nodes) {
      const rings = ringCapacities.map((_, i) => ({ radius: ringRadii[i], size: ringSizes[i], items: [] }));
      let idx = 0;
      for (let r = 0; r < rings.length && idx < nodes.length; r++) {
        const cap = ringCapacities[r];
        const take = Math.min(cap, nodes.length - idx);
        rings[r].items = nodes.slice(idx, idx + take);
        idx += take;
      }
      return rings;
    }

    const imgRings = distribute(imgNodes);
    const outerCount = Math.min(16, circleNodes.length);
    const circRings = outerCount ? [{ radius: circleOuterRadius, size: outerCircleSize, items: circleNodes.slice(0, outerCount) }] : [];

    const RingLayer = ({ ring, ringIndex, asCircles }) => {
      const count = ring.items.length;
      if (!count) return null;
      const step = (2 * Math.PI) / count;
      const offsetAngle = ringIndex === 1
        ? (-(5 * Math.PI) / 36) + (Math.PI / 90)
        : 0;
      return (
        <>
          {ring.items.map((n, i) => {
            const size = ring.size;
            const radius = ring.radius;
            let angle;
            if (asCircles) {
              // Fixed 22.5° slots with first at 11.25° from 12 o'clock, rotated +67.5° CW
              const fixedStep = Math.PI / 8; // 22.5°
              const rotationOffset = 2 * fixedStep; // 67.5° CW
              const baseOffset = -Math.PI / 2 + Math.PI / 16 + rotationOffset;
              const slots = Array.from({ length: 16 }, (_, k) => baseOffset + k * fixedStep);
              if (count === 16) {
                angle = slots[i];
              } else {
                const rightAngles = slots.filter(a => Math.cos(a) >= 0);
                const leftAngles = slots.filter(a => Math.cos(a) < 0);
                const pairIndex = Math.floor(i / 2);
                const useRight = i % 2 === 0; // even index -> right, odd -> left
                if (useRight) {
                  angle = rightAngles[Math.min(pairIndex, rightAngles.length - 1)];
                } else {
                  angle = leftAngles[Math.min(pairIndex, leftAngles.length - 1)] + 2 * fixedStep; // left side: +2 steps CW
                }
              }
            } else {
              // Fixed 8-slot placement for rings 2 and 3, regardless of count
              if (ringIndex === 1 || ringIndex === 2) {
                const fixed8 = (2 * Math.PI) / 8; // 45°
                const base = -Math.PI / 2 + offsetAngle;
                angle = base + i * fixed8;
              } else {
                angle = i * step - Math.PI / 2 + offsetAngle;
              }
            }
            const x = Math.round(cx + radius * Math.cos(angle) - size / 2 - width / 2);
            const y = Math.round(cy + radius * Math.sin(angle) - size / 2 - height / 2);
            if (asCircles || !n.pfp) {
              return (
                <div
                  key={`c-${radius}-${i}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: size,
                    background: 'rgba(80,120,255,0.6)',
                    border: '1px solid #bbb',
                  }}
                />
              );
            }
            return (
              <img
                key={`i-${radius}-${i}`}
                src={n.pfp}
                width={size}
                height={size}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  borderRadius: size,
                  border: '1px solid #bbb',
                }}
              />
            );
          })}
        </>
      );
    };
  


      const svg = await satori(
      <div
        style={{
          width: width,
          height: height,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#0a021f',
        }}
      >
        {imgRings.map((r, idx) => (
          <RingLayer key={`img-${idx}`} ring={r} ringIndex={idx} asCircles={false} />
        ))}
        {circRings.map((r, idx) => (
          <RingLayer key={`cir-${idx}`} ring={r} ringIndex={idx + imgRings.length} asCircles={true} />
        ))}

        {tipperPfp && (
          <img
            src={tipperPfp}
            width={100}
            height={100}
            style={{
              position: "absolute",
              left: `${Math.round(cx - 50)}px`,
              top: `${Math.round(cy - 50)}px`,
              borderRadius: "110px",
              border: "2px solid #bbb",
              // boxShadow: "0 6px 22px rgba(0,0,0,0.35)",
            }}
          />
        )}

        {/* Top-left caption */}
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: 12,
            width: 210,
            textAlign: 'center',
            color: '#acf',
            fontSize: 26,
            lineHeight: 1.15,
            whiteSpace: 'pre-wrap',
          }}
        >
          {`/impact\nmulti-tip`}
        </div>

        {/* Bottom-left caption */}
        <div
          style={{
            position: 'absolute',
            left: 42,
            top: height - 70,
            width: 240,
            color: '#def',
            textAlign: 'center',
            fontSize: 20,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
          }}
        >
          {`${amountLine}\n${tokenLine}`}
        </div>

        {/* Bottom-right caption */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: height - 110,
            width: 240,
            textAlign: 'center',
            color: '#def',
            fontSize: 18,
            lineHeight: 1.15,
            whiteSpace: 'pre-wrap',
          }}
        >
          {creatorsLines}
        </div>
      </div>,
      { width, height, fonts: [{ data: fontData, name: "Inter", style: "normal", weight: 600 }] }
      );
  
      const svgBuffer = Buffer.from(svg);
      const convertSvgToPng = promisify(svg2img);
    const pngBuffer = await convertSvgToPng(svgBuffer, { format: "png", width, height });
    const compressedBuffer = await sharp(pngBuffer).png({ quality: 50, compressionLevel: 9 }).toBuffer();

    // Save compressed image to OnchainTip for future fast serving
    try {
      if (objectId) {
        await OnchainTip.updateOne({ _id: objectId }, { $set: { image: compressedBuffer } });
      }
    } catch (_) {
      // ignore persistence errors for response purposes
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
      res.send(compressedBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
}


