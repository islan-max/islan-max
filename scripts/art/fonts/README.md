# Fonte

`YujiSyuku-subset.ttf` é um recorte da [Yuji Syuku](https://github.com/Kinutafontfactory/Yuji) (licença OFL 1.1, veja `OFL.txt`) com latim, kana e só os kanjis usados na arte. Os textos viram contornos no SVG, então a fonte só é lida na hora de gerar.

Se a arte ganhar um kanji novo, gere o recorte de novo a partir da fonte completa:

```bash
python -m fontTools.subset YujiSyuku-Regular.ttf --unicodes=U+0020-024F,U+2010-2027,U+3040-30FF,U+FF01-FF5E,U+<kanji novo> --layout-features= --no-hinting --output-file=YujiSyuku-subset.ttf
```
