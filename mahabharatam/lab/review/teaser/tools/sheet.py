import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB').resize((300, 533)) for f in files]
cols = min(len(ims), 8); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * 308, rows * 541), '#222')
for i, im in enumerate(ims): S.paste(im, ((i % cols) * 308, (i // cols) * 541))
S.save(out, quality=85)
