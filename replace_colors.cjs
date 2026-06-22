const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds (dark mode)
  { regex: /\bbg-(?:neutral|slate)-(?:800|900)\/(\d{1,3})\b/g, replace: 'bg-[#412D15]/$1' },
  { regex: /\bbg-(?:black|neutral-950)\/(\d{1,3})\b/g, replace: 'bg-[#1F150C]/$1' },
  { regex: /\bbg-(?:black|neutral-950)\b/g, replace: 'bg-[#1F150C]' },
  { regex: /#(?:181c22|161224|0F172A)\b/gi, replace: '#1F150C' },
  { regex: /\bbg-(?:neutral|slate)-(?:900|800)\b/g, replace: 'bg-[#412D15]' },

  // Backgrounds (light mode)
  { regex: /\bbg-(?:white|neutral-50|neutral-100)\/(\d{1,3})\b/g, replace: 'bg-[#FFFCE1]/$1' },
  { regex: /\bbg-(?:white|neutral-50|neutral-100)\b/g, replace: 'bg-[#FFFCE1]' },

  // Borders
  { regex: /\bborder-(?:neutral-(?:200|100)|slate-200)\/(\d{1,3})\b/g, replace: 'border-[#E1DCC9]/$1' },
  { regex: /\bborder-(?:neutral-(?:200|100)|slate-200)\b/g, replace: 'border-[#E1DCC9]/20' },
  { regex: /\bborder-neutral-(?:800|700)\/(\d{1,3})\b/g, replace: 'border-[#412D15]/$1' },
  { regex: /\bborder-neutral-(?:800|700)\b/g, replace: 'border-[#412D15]' },
  { regex: /\bborder-white\/(\d{1,3})\b/g, replace: 'border-[#E1DCC9]/$1' },
  { regex: /\bborder-white\b/g, replace: 'border-[#E1DCC9]' },

  // Text (dark mode)
  { regex: /\btext-(?:white|neutral-50|neutral-100)\/(\d{1,3})\b/g, replace: 'text-[#E1DCC9]/$1' },
  { regex: /\btext-(?:white|neutral-50|neutral-100)\b/g, replace: 'text-[#E1DCC9]' },
  { regex: /\btext-(?:neutral-(?:400|300)|slate-400)\/(\d{1,3})\b/g, replace: 'text-[#7c7c6f]/$1' },
  { regex: /\btext-(?:neutral-(?:400|300)|slate-400)\b/g, replace: 'text-[#7c7c6f]' },

  // Text (light mode)
  { regex: /\btext-neutral-(?:900|800)\/(\d{1,3})\b/g, replace: 'text-[#0e100f]/$1' },
  { regex: /\btext-neutral-(?:900|800)\b/g, replace: 'text-[#0e100f]' },
  { regex: /\btext-neutral-(?:500|600|700)\/(\d{1,3})\b/g, replace: 'text-[#7c7c6f]/$1' },
  { regex: /\btext-neutral-(?:500|600|700)\b/g, replace: 'text-[#7c7c6f]' },

  // Colors
  // Purple brand -> [#9d95ff]
  { regex: /\b([a-z]+)-(?:purple|violet|indigo)-\d{2,3}(?:\/(\d{1,2}))?\b/g, 
    replace: (match, p1, p2) => p2 ? `${p1}-[#9d95ff]/${p2}` : `${p1}-[#9d95ff]` },

  // Blue -> [#00bae2]
  { regex: /\b([a-z]+)-(?:blue|cyan|teal)-\d{2,3}(?:\/(\d{1,2}))?\b/g, 
    replace: (match, p1, p2) => p2 ? `${p1}-[#00bae2]/${p2}` : `${p1}-[#00bae2]` },

  // Emerald/Green -> [#00bae2]
  { regex: /\b([a-z]+)-(?:emerald|green)-\d{2,3}(?:\/(\d{1,2}))?\b/g, 
    replace: (match, p1, p2) => p2 ? `${p1}-[#00bae2]/${p2}` : `${p1}-[#00bae2]` },

  // Red/Rose -> keep as red-500
  { regex: /\b([a-z]+)-(?:red|rose)-\d{2,3}(?:\/(\d{1,2}))?\b/g, 
    replace: (match, p1, p2) => p2 ? `${p1}-red-500/${p2}` : `${p1}-red-500` },

  // Amber/Yellow/Orange -> keep as amber-500
  { regex: /\b([a-z]+)-(?:amber|yellow|orange)-\d{2,3}(?:\/(\d{1,2}))?\b/g, 
    replace: (match, p1, p2) => p2 ? `${p1}-amber-500/${p2}` : `${p1}-amber-500` },
    
  // Also replace some prominent hardcoded hexes from the audit to match semantics
  { regex: /#(?:6D5DFC|4F46E5|8B5CF6|7C3AED|C9C4FF)\b/gi, replace: '#9d95ff' }, // Purples -> Brand
  { regex: /#(?:3B82F6|1978e5|10B981)\b/gi, replace: '#00bae2' }, // Blues/Emeralds -> Blue
  { regex: /#(?:EC4899)\b/gi, replace: '#ef4444' } // Pink -> Red hex equivalent approx
];

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let filesChanged = 0;

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let content = originalContent;

    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesChanged++;
    }
  }
});

console.log(`Successfully updated colors in ${filesChanged} files.`);
