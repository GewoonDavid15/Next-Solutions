package nl.nextsolutionshq.app

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ParseTest {
    private val sample = """
    {"gebruiker":{"id":"1","naam":"David","gebruikersnaam":"gewoondavid","avatar":null},
     "projecten":[{"id":"9","naam":"Website","fase":2,"faseNaam":"Bouwen","faseEmoji":"🔨","fases":[{"nr":1,"naam":"Ontwerp","emoji":"🎨"},{"nr":2,"naam":"Bouwen","emoji":"🔨"}],"percentage":140,"notitie":"","deadline":null,"bijgewerkt":1700000000000,"geschiedenis":[]}],
     "tickets":[{"id":"5","naam":"ticket-david","afdeling":"Software","emoji":"💻","geopend":1,"geclaimdDoor":null,"link":"x"}],
     "offertes":[{"nummer":"NS-0001","titel":"Bot","prijs":"€ 100","status":"Open","statusEmoji":"🟡","t":1,"betaald":false}],
     "bugs":[],
     "profiel":{"niveau":{"level":3,"titel":"Vaste klant","xp":120,"procent":40},"badges":[{"id":"a","naam":"Eerste project","emoji":"🚀","behaald":true,"uitleg":"x"}]},
     "afdelingen":[{"id":"software","titel":"Software","emoji":"💻","kort":"Bots","onderwerpVoorbeeld":"","detailsLabel":"","detailsVoorbeeld":""}],
     "meldingen":{"meldingen":[{"id":"m1","t":2,"soort":"ticket","titel":"Antwoord","tekst":"Hoi","link":"/klantportaal#tickets","doel":{"soort":"ticket","id":"555"},"gelezen":false}],"ongelezen":1},
     "social":{"posts":[{"id":"p1","platform":"Instagram","datum":5,"type":"post","titel":"Lancering","caption":"","media":[],"status":"ter-goedkeuring","feedback":[]}],"rapporten":[],"uploads":[],"abonnement":null},
     "eigenaar":true,"kanReviewen":true}
    """.trimIndent()

    @Test fun parsesPortalData() {
        val d = Parse.portal(JSONObject(sample))
        assertEquals("David", d.user.name)
        assertEquals(100, d.projects[0].percentage) // clamped
        assertNull(d.projects[0].deadline)
        assertEquals(2, d.projects[0].phases.size)
        assertEquals("NS-0001", d.offers[0].number)
        assertNull(d.offers[0].id) // older bot: no id, so no accept button
        assertEquals(1, d.unread)
        assertEquals(3, d.profile?.level?.level)
        assertTrue(d.files.isEmpty())
        assertEquals(Target("ticket", "555"), d.notifications[0].target)
        assertEquals("ter-goedkeuring", d.social?.posts?.get(0)?.status)
        assertTrue(d.social!!.active && d.owner && d.canReview)
    }

    @Test fun encodesTargets() {
        assertEquals(Target("project", "12"), Target.decode(Target("project", "12").encode()))
        assertEquals(Target("beheer", null), Target.decode("beheer"))
        assertNull(Target.decode(""))
    }

    @Test fun toleratesMissingFields() {
        val d = Parse.portal(JSONObject("{}"))
        assertTrue(d.projects.isEmpty() && d.tickets.isEmpty() && d.notifications.isEmpty())
        assertNull(d.profile)
    }

    @Test fun mapsNotificationLinksToTabs() {
        assertEquals("tickets", MeldingenWorker.tabFor("/klantportaal#tickets"))
        assertEquals("projecten", MeldingenWorker.tabFor("/klantportaal/project/123"))
        assertEquals("overzicht", MeldingenWorker.tabFor(null))
        assertEquals("beheer", MeldingenWorker.tabFor("/dashboard"))
    }
}
