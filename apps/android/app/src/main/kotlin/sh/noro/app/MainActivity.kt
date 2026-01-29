package sh.noro.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import sh.noro.app.ui.screens.GeneratorScreen
import sh.noro.app.ui.screens.ItemScreen
import sh.noro.app.ui.screens.LoginScreen
import sh.noro.app.ui.screens.VaultScreen
import sh.noro.app.ui.theme.NoroTheme

class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NoroTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NoroApp()
                }
            }
        }
    }
}

@Composable
fun NoroApp() {
    val navController = rememberNavController()
    var isAuthenticated by remember { mutableStateOf(false) }

    NavHost(
        navController = navController,
        startDestination = if (isAuthenticated) "vault" else "login"
    ) {
        composable("login") {
            LoginScreen(
                onAuthenticated = {
                    isAuthenticated = true
                    navController.navigate("vault") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }

        composable("vault") {
            VaultScreen(
                onItemClick = { itemId ->
                    navController.navigate("item/$itemId")
                },
                onGeneratorClick = {
                    navController.navigate("generator")
                },
                onLogout = {
                    isAuthenticated = false
                    navController.navigate("login") {
                        popUpTo("vault") { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = "item/{itemId}",
            arguments = listOf(navArgument("itemId") { type = NavType.StringType })
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId") ?: ""
            ItemScreen(
                itemId = itemId,
                onBack = { navController.popBackStack() }
            )
        }

        composable("generator") {
            GeneratorScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
