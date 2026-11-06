package nl.nextsolutionshq.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Ink = Color(0xFF0A0C10)
val Surface1 = Color(0xFF12151C)
val Surface2 = Color(0xFF1A1E27)
val Lime = Color(0xFFC6F432)
val Muted = Color(0xFFA1A1AA)
val Faint = Color(0xFF71717A)
val Danger = Color(0xFFFB7185)
val Success = Color(0xFF34D399)

private val colors = darkColorScheme(
    primary = Lime,
    onPrimary = Ink,
    primaryContainer = Color(0xFF2B3510),
    onPrimaryContainer = Lime,
    secondary = Color(0xFF6E9BFF),
    background = Ink,
    onBackground = Color.White,
    surface = Surface1,
    onSurface = Color.White,
    surfaceVariant = Surface2,
    onSurfaceVariant = Muted,
    surfaceContainer = Surface1,
    surfaceContainerHigh = Surface2,
    surfaceContainerHighest = Color(0xFF232836),
    outline = Color(0xFF2A3040),
    outlineVariant = Color(0xFF1F2430),
    error = Danger,
)

@Composable
fun NextTheme(content: @Composable () -> Unit) = MaterialTheme(colorScheme = colors, content = content)
