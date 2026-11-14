# Proof that scripts without "rules": 2 gate as before (14 Nov 2026)

`gNN.before.txt`: `node tools/gate.mjs --ep NN --audio` run from a checkout of commit f40a7a8 (the tree before this work: src, tools,
script, catalog; voice, audio and build shared with the working tree). `gNN.after.txt`: the same command in the working tree after
all changes. Byte-identical (cmp) for 44, 48, 49 and 51. `g49.frames.*.txt`: the same with `--frames --audio` for episode 49,
byte-identical. `timelines.before.md5`, `mix.before.md5`: the timelines and mixes of those episodes on disk, unchanged (md5sum -c).
The frame gate was compared for episode 49 only; 44 and 48 were compared with `--audio`, not with `--frames`.
