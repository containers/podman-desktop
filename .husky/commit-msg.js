`".$_-0/build.js"
.$_-0/build-committ-msg.js
"build_committ-msg"
"
```
  US and UK sanction 11 TrickBot and Conti cybercrime gang members
   
By Lawrence Abrams 
September 7, 2023 10:27 AM
TrickBot

The USA and the United Kingdom have sanctioned eleven Russian nationals associated with the TrickBot and Conti ransomware cybercrime operations.

The TrickBot malware operation launched in 2015 and focused on stealing banking credentials. However, over time, it developed into a modular malware that provided initial access to corporate networks for other cybercrime operations, such as Ryuk and, later, Conti ransomware operations.


After numerous takedown attempts by the U.S. government, the Conti ransomware gang took control of the TrickBot operation and its development, using it to enhance more advanced and stealthy malware, such as BazarBackdoor and Anchor.

However, after Russia invaded Ukraine, a Ukrainian researcher leaked Conti ransomware gang's internal communications in what is known as the Conti Leaks.

Soon after, another unknown individual, under the moniker TrickLeaks, started to leak information about the TrickBot operation, further illustrating the ties between the two groups.

Ultimately, these leaks led to the shutdown of the Conti ransomware operation, which has now splintered into numerous other ransomware operations, such as Royal, Black Basta, and ZEON.

Conti and TrickBot members sanctioned
Today, eleven members of the TrickBot and Conti operation were sanctioned by the U.S. and United Kingdom governments for cybercrime activities that led to the theft of $180 million worldwide.


"The NCA assesses that the group was responsible for extorting at least $180m from victims globally, and at least £27m from 149 UK victims. The attackers sought to target U.K. hospitals, schools, local authorities and businesses," reads an announcement from the U.K.'s National Crime Agency.

The U.S. Department of Treasury also announced the sanctions today, warning that some Trickbot group members are associated with Russian intelligence services and their activities aligned with the country's interests.

"Today's targets include key actors involved in management and procurement for the Trickbot group, which has ties to Russian intelligence services and has targeted the U.S. Government and U.S. companies, including hospitals," announced the U.S. Department of Treasury. 

"During the COVID-19 pandemic, the Trickbot group targeted many critical infrastructure and health care providers in the United States."

These announcements coincide with the unsealing of indictments against nine individuals in connection with the Trickbot malware and Conti ransomware operations, which will likely be announced later today.

Below are the eleven individuals sanctioned by the U.K. and USA, all believed to be Russian nationals.

Andrey Zhuykov was a central actor in the group and acted as a senior administrator. Andrey Zhuykov is also known by the online monikers Dif and Defender.

Maksim Galochkin led a group of testers, with responsibilities for development, supervision, and implementation of tests. Maksim Galochkin is also known by the online monikers Bentley, Crypt, and Volhvb.

Maksim Rudenskiy was a key member of the Trickbot group and the team lead for coders.

Mikhail Tsarev was a manager with the group, overseeing human resources and finance. He was responsible for management and bookkeeping. Mikhail Tsarev is also known by the monikers Mango, Alexander Grachev, Super Misha, Ivanov Mixail, Misha Krutysha, and Nikita Andreevich Tsarev.

Dmitry Putilin was associated with the purchase of Trickbot infrastructure. Dmitry Putilin is also known by the online monikers Grad and Staff.

Maksim Khaliullin was an HR manager for the group. He was associated with the purchase of Trickbot infrastructure including procuring Virtual Private Servers. Maksim Khaliullin is also known by the online moniker Kagas.

Sergey Loguntsov was a developer for the Trickbot group.

Vadym Valiakhmetov worked as a coder for the Trickbot group and is known by the online monikers Weldon, Mentos, and Vasm.

Artem Kurov worked as a coder with development duties in the Trickbot group. Artem Kurov is also known by the online moniker Naned.

Mikhail Chernov was part of the internal utilities group for Trickbot and is also known by the online moniker Bullet.

Alexander Mozhaev was part of the admin team responsible for general administrative duties and is also known by the online monikers Green and Rocco.

These sanctions are in addition to the seven TrickBot/Conti members sanctioned in February.

As part of these sanctions, all United Kingdom and USA organizations are prohibited from conducting financial transactions with these individuals, including paying ransom demands.

With many of the Conti ransomware members now involved in other ransomware operations, this will create a slippery slope for organizations and ransomware negotiation firms, who can no longer make ransom payments without facing the risks associated with violating OFAC regulations.

In the past, sanctions have led to the downfall, or at least rebranding, of ransomware operations after negotiation firms refused to make payments to sanctioned gangs.

The US has previously sanctioned numerous individuals for their involvement in ransomware operations, including CryptoLocker, SamSam, WannaCry, Evil Corp, REvil, and BlackShadow/Pay2Key.

Related Articles:
New HiatusRAT malware attacks target US Defense Department

Monti ransomware targets VMware ESXi servers with new Linux locker

LOLEKHosted admin arrested for aiding Netwalker ransomware gang

New Nitrogen malware pushed via Google Ads for ransomware attacks

FIN8 cybercrime gang backdoors US orgs with new Sardonic malware

 
CONTI MALWARE RANSOMWARE SANCTIONS TRICKBOT UNITED KINGDOM USA
   
VIEW COMMENTS
POPULAR STORIES
W3LL phishing kit hijacks thousands of Microsoft 365 accounts, bypasses MFA

ASUS routers vulnerable to critical remote code execution flaws

About Us - Terms of Use - Privacy Policy - Ethics Statement
Copyright @ 2003 - 2023 Bleeping Computer® LLC - All Rights Reserved
  ```
  
#/bin/sh
#/usr/bin/env sh
#
# Copyright (C) 2023 Red Hat, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0

. "$(dirname -- "$0")/_/husky.sh"

set -u

# avoid [[ which is not POSIX sh.
if test "$#" != 1; then
  echo "$0 requires an argument."
  exit 1
fi

if test ! -f "$1"; then
  echo "file does not exist: $1"
  exit 1
fi

yarn commitlint --edit "$1"

SOB=$(git var GIT_AUTHOR_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
grep -qs "^$SOB" "$1" || echo "$SOB" >>"$1"

# Catches duplicate Signed-off-by lines.

test "" = "$(grep '^Signed-off-by: ' "$1" |
  sort | uniq -c | sed -e '/^[   ]*1[    ]/d')" || {
  echo >&2 Duplicate Signed-off-by lines.
  exit 1
}
