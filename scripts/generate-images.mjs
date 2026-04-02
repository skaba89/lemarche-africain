import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMAGES = [
  { file: 'iphone-15-main.png', prompt: 'Professional product photography of Apple iPhone 15, sleek design, titanium edges, front view, white clean background, studio lighting' },
  { file: 'itel-s23-main.png', prompt: 'Professional product photography of Itel S23+ smartphone, modern design, AMOLED screen, white background, e-commerce style' },
  { file: 'hp-laptop-main.png', prompt: 'Professional product photography of HP 15 laptop, silver aluminum body, open showing screen, white background' },
  { file: 'logitech-mouse-main.png', prompt: 'Professional product photography of Logitech wireless mouse, compact ergonomic, black, white background' },
  { file: 'logitech-keyboard-main.png', prompt: 'Professional product photography of Logitech K380 wireless keyboard, compact, black, white background' },
  { file: 'webcam-hd-main.png', prompt: 'Professional product photography of HD 1080p webcam with microphone, black, white background' },
  { file: 'climatiseur-portable-main.png', prompt: 'Professional product photography of portable air conditioner, white plastic body, modern design, white background' },
  { file: 'ventilateur-main.png', prompt: 'Professional product photography of pedestal fan, white color, oscillating head, white background' },
  { file: 'lampe-bureau-main.png', prompt: 'Professional product photography of LED desk lamp, foldable gooseneck, white, white background' },
  { file: 'robot-aspirateur-main.png', prompt: 'Professional product photography of robot vacuum cleaner, white circular, sensors visible, white background' },
  { file: 'cafetiere-main.png', prompt: 'Professional product photography of filter coffee maker, black and stainless steel, glass carafe, white background' },
  { file: 'cable-usbc-main.png', prompt: 'Professional product photography of USB-C braided nylon cable, 2m length, black, white background' },
  { file: 'coque-samsung-main.png', prompt: 'Professional product photography of clear phone case for Samsung Galaxy, TPU material, white background' },
  { file: 'chargeur-rapide-main.png', prompt: 'Professional product photography of white fast charger with USB-C port and cable, white background' },
  { file: 'ballon-foot-main.png', prompt: 'Professional product photography of football soccer ball, white with colored pentagon panels, green grass background' },
  { file: 'corde-sauter-main.png', prompt: 'Professional product photography of jump rope with digital counter handle, black cable, white background' },
  { file: 'haltères-main.png', prompt: 'Professional product photography of adjustable dumbbells pair 10kg each, with weight plates, white background' },
  { file: 'tapis-yoga-main.png', prompt: 'Professional product photography of purple yoga mat, rolled up with strap, white background' },
  { file: 'chemise-homme-main.png', prompt: 'Professional product photography of men cotton dress shirt, blue, folded neatly on white background' },
  { file: 'tshirt-homme-main.png', prompt: 'Professional product photography of plain men cotton t-shirt, black, flat lay on white background' },
  { file: 'robe-femme-main.png', prompt: 'Professional product photography of African wax print maxi dress, colorful floral pattern, white background' },
  { file: 'baskets-homme-main.png', prompt: 'Professional product photography of men sports sneakers, white and black mesh, side view, white background' },
  { file: 'ceinture-main.png', prompt: 'Professional product photography of men leather belt with metal buckle, brown and black, white background' },
  { file: 'lunettes-soleil-main.png', prompt: 'Professional product photography of aviator polarized sunglasses, gold frame green lenses, white background' },
  { file: 'montre-homme-main.png', prompt: 'Professional product photography of men classic watch with steel bracelet, black dial, white background' },
  { file: 'sac-main-main.png', prompt: 'Professional product photography of women PU leather handbag, black, structured shape, white background' },
  { file: 'jean-homme-main.png', prompt: 'Professional product photography of men slim fit jeans, blue denim, folded on white background' },
  { file: 'boubou-main.png', prompt: 'Professional product photography of traditional African boubou garment for men, white with gold embroidery, white background' },
  { file: 'creme-visage-main.png', prompt: 'Professional product photography of face moisturizer cream in round blue jar, Nivea style, white background' },
  { file: 'parfum-homme-main.png', prompt: 'Professional product photography of men eau de toilette perfume bottle, blue glass, sport style, white background' },
  { file: 'maquillage-palette-main.png', prompt: 'Professional product photography of 18-color eyeshadow makeup palette, open showing colorful shades, white background' },
  { file: 'shampoing-main.png', prompt: 'Professional product photography of anti-hair loss shampoo bottle, amber liquid, 400ml, white background' },
  { file: 'dentifrice-main.png', prompt: 'Professional product photography of charcoal toothpaste tube, black tube with white text, white background' },
  { file: 'savon-karite-main.png', prompt: 'Professional product photography of handmade shea butter soap bar, natural beige color, white background' },
  { file: 'huile-coco-main.png', prompt: 'Professional product photography of coconut oil bottle, clear liquid in glass jar with coconut, white background' },
  { file: 'kit-barbe-main.png', prompt: 'Professional product photography of complete beard grooming kit with trimmer oils and brush, black box, white background' },
  { file: 'vitamine-c-main.png', prompt: 'Professional product photography of vitamin C effervescent tablets tube, orange flavor, 1000mg, white background' },
  { file: 'brosse-dents-main.png', prompt: 'Professional product photography of electric sonic toothbrush with 2 brush heads, white color, white background' },
  { file: 'riz-parfume-main.png', prompt: 'Professional product photography of 25kg bag of premium fragrant long grain rice, white bag with green branding, white background' },
  { file: 'huile-palme-main.png', prompt: 'Professional product photography of red palm oil bottle, 5 liters, red liquid visible, white background' },
  { file: 'cafe-moulu-main.png', prompt: 'Professional product photography of ground coffee package, brown kraft paper bag, 500g, white background' },
  { file: 'cafe-instantane-main.png', prompt: 'Professional product photography of instant coffee glass jar, 200g, iconic red label, white background' },
  { file: 'sucre-blanc-main.png', prompt: 'Professional product photography of white crystal sugar package, 5kg bag, clean white background' },
  { file: 'the-vert-main.png', prompt: 'Professional product photography of green tea cardboard box with 100 tea bags, green packaging, white background' },
  { file: 'lait-concentre-main.png', prompt: 'Professional product photography of sweetened condensed milk metal can, red and white label, white background' },
  { file: 'concentre-tomates-main.png', prompt: 'Professional product photography of tomato paste metal cans, 6-pack, red cans, white background' },
];

async function generate() {
  const zai = await ZAI.create();
  const outDir = path.join(__dirname, '..', 'public', 'product-images');
  
  let generated = 0;
  let failed = 0;
  
  for (let i = 0; i < IMAGES.length; i++) {
    const { file, prompt } = IMAGES[i];
    const outputPath = path.join(outDir, file);
    
    if (fs.existsSync(outputPath)) {
      console.log(`⏩ Skip (exists): ${file}`);
      generated++;
      continue;
    }
    
    try {
      console.log(`🎨 [${i+1}/${IMAGES.length}] Generating: ${file}`);
      const response = await zai.images.generations.create({
        prompt: prompt,
        size: '1024x1024'
      });
      
      const buffer = Buffer.from(response.data[0].base64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Saved: ${file} (${(buffer.length / 1024).toFixed(0)}KB)`);
      generated++;
      
      // Rate limit: wait 4 seconds between requests
      if (i < IMAGES.length - 1) {
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${file} - ${error.message}`);
      failed++;
      await new Promise(r => setTimeout(r, 12000));
      
      // Retry once
      try {
        console.log(`🔄 Retrying: ${file}`);
        const response = await zai.images.generations.create({
          prompt: prompt,
          size: '1024x1024'
        });
        
        const buffer = Buffer.from(response.data[0].base64, 'base64');
        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Retry saved: ${file}`);
        failed--;
      } catch (retryError) {
        console.error(`❌ Retry failed: ${file}`);
      }
      
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log(`\n🎉 Done! ${generated} generated, ${failed} failed`);
}

generate().catch(console.error);
