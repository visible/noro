package sh.noro.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF818CF8),
    onPrimary = Color(0xFF1E1B4B),
    primaryContainer = Color(0xFF3730A3),
    onPrimaryContainer = Color(0xFFE0E7FF),
    secondary = Color(0xFFA5B4FC),
    onSecondary = Color(0xFF1E1B4B),
    background = Color(0xFF0C0A09),
    onBackground = Color(0xFFFAFAF9),
    surface = Color(0xFF1C1917),
    onSurface = Color(0xFFFAFAF9),
    surfaceVariant = Color(0xFF292524),
    onSurfaceVariant = Color(0xFFA8A29E),
    outline = Color(0xFF44403C),
    error = Color(0xFFF87171),
    onError = Color(0xFF7F1D1D)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF4F46E5),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFE0E7FF),
    onPrimaryContainer = Color(0xFF1E1B4B),
    secondary = Color(0xFF6366F1),
    onSecondary = Color(0xFFFFFFFF),
    background = Color(0xFFFAFAF9),
    onBackground = Color(0xFF0C0A09),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF0C0A09),
    surfaceVariant = Color(0xFFF5F5F4),
    onSurfaceVariant = Color(0xFF57534E),
    outline = Color(0xFFD6D3D1),
    error = Color(0xFFDC2626),
    onError = Color(0xFFFFFFFF)
)

@Composable
fun NoroTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
