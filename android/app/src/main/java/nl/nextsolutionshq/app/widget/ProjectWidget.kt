package nl.nextsolutionshq.app.widget

import android.content.Context
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.updateAll
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import nl.nextsolutionshq.app.Cache
import nl.nextsolutionshq.app.MainActivity
import nl.nextsolutionshq.app.t

private val ink = Color(0xFF0A0C10)
private val lime = Color(0xFFC6F432)
private val muted = Color(0xFFA1A1AA)
private fun fixed(c: Color) = ColorProvider(day = c, night = c)

/** Home screen widget: the progress of the current project (from the last data the app loaded). */
class ProjectWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = Cache.load(context)?.first
        val project = data?.projects?.filter { it.percentage < 100 }?.maxByOrNull { it.updated ?: 0 }
        provideContent {
            Column(
                GlanceModifier.fillMaxSize().background(fixed(ink)).cornerRadius(20.dp).padding(14.dp)
                    .clickable(actionStartActivity<MainActivity>()),
            ) {
                Text("Next Solutions", style = TextStyle(color = fixed(lime), fontSize = 12.sp, fontWeight = FontWeight.Bold))
                Spacer(GlanceModifier.height(6.dp))
                when {
                    data == null -> Text(t("Open de app om in te loggen", "Open the app to log in"), style = TextStyle(color = fixed(muted), fontSize = 13.sp))
                    project == null -> Text(t("Geen lopend project", "No project in progress"), style = TextStyle(color = fixed(Color.White), fontSize = 14.sp))
                    else -> {
                        Row(GlanceModifier.fillMaxWidth()) {
                            Text(project.name, style = TextStyle(color = fixed(Color.White), fontSize = 15.sp, fontWeight = FontWeight.Bold), maxLines = 1, modifier = GlanceModifier.defaultWeight())
                            Text("${project.percentage}%", style = TextStyle(color = fixed(lime), fontSize = 15.sp, fontWeight = FontWeight.Bold))
                        }
                        Text("${project.phaseEmoji} ${project.phaseName}", style = TextStyle(color = fixed(muted), fontSize = 12.sp), maxLines = 1)
                        Spacer(GlanceModifier.height(8.dp))
                        LinearProgressIndicator(
                            progress = project.percentage / 100f,
                            modifier = GlanceModifier.fillMaxWidth().height(6.dp),
                            color = fixed(lime),
                            backgroundColor = fixed(Color(0xFF2A3040)),
                        )
                    }
                }
            }
        }
    }

    companion object {
        suspend fun refresh(context: Context) = runCatching { ProjectWidget().updateAll(context) }
    }
}

class ProjectWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget = ProjectWidget()
}
