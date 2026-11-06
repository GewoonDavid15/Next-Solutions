package nl.nextsolutionshq.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

private val nl = Locale("nl", "NL")
private val amsterdam = TimeZone.getTimeZone("Europe/Amsterdam")
private fun fmt(pattern: String) = SimpleDateFormat(pattern, nl).apply { timeZone = amsterdam }

fun date(t: Long): String = fmt("d MMM yyyy").format(Date(t))
fun dateTime(t: Long): String = fmt("d MMM, HH:mm").format(Date(t))
fun time(t: Long): String = fmt("HH:mm").format(Date(t))
fun dayLabel(t: Long): String = fmt("EEE d MMM").format(Date(t))
fun dayKey(t: Long): String = fmt("yyyy-MM-dd").format(Date(t))

fun timeAgo(t: Long, now: Long = System.currentTimeMillis()): String {
    val min = (now - t) / 60_000
    return when {
        min < 1 -> "zojuist"
        min < 60 -> "$min min geleden"
        min < 24 * 60 -> "${min / 60} uur geleden"
        min < 7 * 24 * 60 -> "${min / (24 * 60)} dagen geleden"
        else -> date(t)
    }
}

fun fileSize(bytes: Long): String = when {
    bytes >= 1_048_576 -> String.format(nl, "%.1f MB", bytes / 1_048_576.0)
    bytes >= 1024 -> "${bytes / 1024} kB"
    else -> "$bytes B"
}

@Composable
fun Panel(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable () -> Unit) {
    val shape = RoundedCornerShape(22.dp)
    Box(
        modifier
            .fillMaxWidth()
            .clip(shape)
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(16.dp),
    ) { content() }
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier) {
    Text(text, modifier.padding(top = 8.dp, bottom = 4.dp), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
}

@Composable
fun ProgressBar(percent: Int, modifier: Modifier = Modifier, color: Color = Lime) {
    Box(modifier.fillMaxWidth().height(8.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.08f))) {
        Box(Modifier.fillMaxWidth((percent.coerceIn(0, 100) / 100f).coerceAtLeast(0.03f)).height(8.dp).clip(CircleShape).background(color))
    }
}

@Composable
fun Pill(text: String, color: Color = Lime) {
    Text(
        text,
        Modifier.clip(RoundedCornerShape(50)).background(color.copy(alpha = 0.15f)).padding(horizontal = 10.dp, vertical = 4.dp),
        color = color, fontSize = 12.sp, fontWeight = FontWeight.SemiBold,
    )
}

@Composable
fun Avatar(url: String?, name: String, size: Int = 44) {
    if (url != null) {
        AsyncImage(model = url, contentDescription = null, modifier = Modifier.size(size.dp).clip(CircleShape))
    } else {
        Box(Modifier.size(size.dp).clip(CircleShape).background(Lime), contentAlignment = Alignment.Center) {
            Text(name.take(1).uppercase(), color = Ink, fontWeight = FontWeight.Bold, fontSize = (size / 2.4).sp)
        }
    }
}

@Composable
fun EmptyState(emoji: String, title: String, text: String, action: String? = null, onAction: (() -> Unit)? = null) {
    Column(Modifier.fillMaxWidth().padding(vertical = 40.dp, horizontal = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(emoji, fontSize = 40.sp)
        Spacer(Modifier.height(12.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(6.dp))
        Text(text, color = Muted, textAlign = TextAlign.Center)
        if (action != null && onAction != null) {
            Spacer(Modifier.height(16.dp))
            Button(onClick = onAction) { Text(action) }
        }
    }
}

@Composable
fun ErrorBox(text: String, onRetry: (() -> Unit)? = null) {
    Panel {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(text, color = Danger)
            if (onRetry != null) Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = Surface2, contentColor = Color.White)) { Text("Opnieuw proberen") }
        }
    }
}

@Composable
fun KeyValue(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Muted, fontSize = 14.sp)
        Text(value, fontSize = 14.sp, textAlign = TextAlign.End, modifier = Modifier.padding(start = 12.dp))
    }
}
