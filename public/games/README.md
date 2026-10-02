# Game logo assets

`GameBadge` (`components/games/GameBadge.tsx`) shows each game's official mark, tinted for
contrast, on the game's brand colour. The marks are inlined as SVG path data in
`components/games/logos.ts`, copied from [Simple Icons](https://simpleicons.org) v16.33.0
(project licence CC0 1.0). Games without a mark there fall back to a monogram badge.

The marks themselves are trademarks of their publishers. They're shown only to identify
each game, not to suggest endorsement. Check the
[Simple Icons disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
and each publisher's brand guidelines before using them elsewhere.

To add or replace a logo:

1. Prefer the publisher's official press kit / media page, and confirm the licence allows
   use in a third-party app like this one. Record the source and licence below.
2. Add a single-path 24×24 SVG path to `GAME_LOGO_PATHS` in `components/games/logos.ts`.

Do not hotlink or scrape logos from game websites or CDNs.

| Game | Mark | Source | Licence |
| --- | --- | --- | --- |
| Dota 2 | Simple Icons `dota2` | https://commons.wikimedia.org/wiki/File:Dota_logo.svg | Trademark of Valve |
| Counter-Strike 2 | Simple Icons `counterstrike` | https://www.counter-strike.net | Trademark of Valve |
| League of Legends | Simple Icons `leagueoflegends` | https://www.leagueoflegends.com | Trademark of Riot Games |
| Valorant | Simple Icons `valorant` | https://commons.wikimedia.org/wiki/File:Valorant_logo_-_black_color_version.svg | Trademark of Riot Games |
| Mobile Legends: Bang Bang | monogram | (not in Simple Icons) | |
| Delta Force | monogram | (not in Simple Icons) | |
