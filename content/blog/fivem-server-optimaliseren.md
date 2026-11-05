---
title: "Vijf oorzaken van een trage FiveM server"
description: "Je resmon staat in het rood en spelers klagen over lag. Dit zijn de verdachten die we het vaakst tegenkomen."
date: "2026-10-12"
author: "Next Solutions"
category: "Game Development"
---

Een server die bij vijftig spelers soepel loopt en bij honderd instort, heeft zelden een hardwareprobleem. In bijna alle gevallen die wij bekijken zit het in de resources.

## 1. Loops die altijd draaien

De klassieker. Een `Citizen.CreateThread` met een `Wait(0)` die continu controleert of de speler ergens in de buurt staat. Eén zo'n loop merk je niet; twintig scripts die het doen wel.

Verhoog de wachttijd zodra de speler niet in de buurt is. Honderd milliseconden in plaats van nul scheelt vaak een factor tien.

## 2. Database-queries in de verkeerde volgorde

Elke query die je uitvoert terwijl de speler staat te wachten, voel je. Haal gegevens op bij het inladen en houd ze in het geheugen, in plaats van bij iedere actie opnieuw te vragen.

## 3. Te veel entiteiten in de wereld

Voertuigen en props die nooit opgeruimd worden, stapelen zich op. Een opruimtaak die elke paar minuten draait, lost meer op dan je denkt.

## 4. NUI die blijft draaien

Een interface die onzichtbaar is maar nog wel rekent, kost gewoon prestatie. Zet hem stil zodra hij dicht gaat.

## 5. Scripts die elkaar dubbel doen

Twee resources die allebei de kentekens bijhouden, of drie die hun eigen notificatiesysteem meebrengen. Dat zie je pas als je de hele lijst naast elkaar legt.

## Hoe wij het aanpakken

We beginnen altijd met meten, niet met gokken. Met `resmon 1` en een paar uur echte spelers zie je binnen een avond welke resources het probleem zijn. Daarna pas gaan we herschrijven — meestal blijkt twintig procent van de scripts tachtig procent van de last te veroorzaken.
