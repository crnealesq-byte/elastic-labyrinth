# Elastic Labyrinth

A musical, interactive tesseract network. Concept by Kit; implemented with ChatGPT.

## Start

Open `index.html` in a modern desktop browser, or host these files as a static website. No installation, API keys, server backend, or external libraries are needed. A separate `Elastic-Labyrinth-Offline.html` contains the complete application in one file. On phones, serving the site over HTTPS is usually easier than opening downloaded HTML through a file viewer.

1. Tap **Enable sound** (sound requires a user gesture).
2. Press **Send** to route a message to the selected destination.
3. Select **Inside** and choose a portal, or use the room buttons beside the gate sliders.
4. Adjust a slider: below 10% the gate closes; above that threshold it is usable.
5. Press **Sever W** to split the network into two cubes. Restore gates to reconnect them.
6. Run **Train & compare** to estimate link delays and compare routes. Export results as JSON for inspection.

## Publish on GitHub Pages

Use a new repository or an explicitly chosen folder in an existing one. Avoid replacing another site's files accidentally.

1. Extract the ZIP. Upload its contents so `index.html`, `styles.css`, `core.js`, and `app.js` are at the repository root, not inside an extra enclosing folder. Include `.nojekyll` if using Git.
2. In repository **Settings → Pages**, choose **Deploy from a branch**.
3. Choose the branch containing the files (usually `main`) and **/(root)**, then save.
4. Wait for GitHub's deployment, then open the site URL GitHub reports.

All asset paths are relative, so repository project URLs work. There is no build step. If you prefer `/docs`, place the four website files there and choose `/docs` as the publishing folder.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Files

- `index.html`: interface and explanatory copy.
- `styles.css`: responsive layout and visual design.
- `core.js`: pure graph, shortest paths, seeded benchmark and delay estimation.
- `app.js`: projected geometry, conceptual interior, controls, packet animation and Web Audio.
- `test.cjs`: meaningful graph and experiment checks; run `node test.cjs`.
- `.nojekyll`: GitHub Pages static-file marker.

## Model specification

Q4 has 16 four-bit vertices, 32 undirected edges and degree four. Axis X flips the least significant bit; W flips the most significant bit. The outside view applies rotations in XW, YW and ZW planes, projects into 3D and then into the canvas. The interior is a conceptual room containing four portals, not a literal slice of a four-dimensional solid. Crossing a portal changes exactly one address bit.

Each edge has one symmetric gate value. Values below 0.1 block the edge. Packet routing uses Dijkstra with unit costs (fewest hops) or estimated link delay divided by current gate opening. It recomputes at each arrival and has a 64-hop guard. Closing a gate immediately drops packets on that edge; other packets may reroute at their next arrival. Animation time is illustrative and separate from benchmark latency. Rotation pause freezes rotation only, not packets.

Sound is local oscillator synthesis with a direction-specific register and waveform. Voice names are evocative, not sampled instruments. Audio is capped at nine note starts per second to limit overload. It starts muted and pauses while the document is hidden. No microphone or media uploads are used.

## Learning experiment

The experiment uses the current gate layout, seed 1729, persistent synthetic edge delays and independent multiplicative observation noise. It begins with one observation of each usable edge, then performs 240 training source/destination journeys. Every fourth training journey follows a fewest-hop route for exploration; others use current delay estimates. Each observed link updates its sample mean. No held-out observations update the estimator.

Evaluation uses 160 fresh source/destination demands. For each demand both policies see the same sampled delay on each edge and the same gate layout. Delays are reported in arbitrary simulation units, not seconds or joules. Means exclude disconnected demands; delivery counts are also reported. Initial training observations and journeys incur costs that are not included in held-out mean delay. This is a stationary synthetic routing benchmark, not evidence of general superiority.

The baseline minimizes hops. The adaptive policy minimizes estimated delay. Thus the comparison combines a different objective with learned cost information; it does not isolate a novel learning algorithm. It does not automatically learn gate openings, modify topology, train a language model, or establish quantum, plasma, or hardware capabilities. Later experiments can add trainable gates, nonstationary costs, alternative baselines and energy accounting.

After changing gates, rerun the experiment for updated benchmark results. Existing estimates may still guide interactive routing, with current openings applied. All state is local and temporary; reload clears it. Exported JSON includes the seed, gate snapshot, estimates, observation counts, aggregate metrics and every test route.

## Validation

Automated checks cover graph counts and degrees, all-pairs shortest paths in the intact graph, the W cut, isolation, weighted detours, reproducibility and failure-aware evaluation. Browser checks cover desktop and a 390px-wide phone layout, outside/inside switching, room navigation, sound activation, blocked destinations and benchmark reporting. Audio activation was checked, but sound quality was not audited on physical speakers. No live GitHub deployment is included in the downloadable package.
