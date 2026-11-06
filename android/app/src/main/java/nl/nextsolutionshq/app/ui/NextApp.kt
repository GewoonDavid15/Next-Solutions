package nl.nextsolutionshq.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.Auth

sealed interface Route {
    val title: String
    data object Home : Route { override val title = "Overzicht" }
    data object Projects : Route { override val title = "Projecten" }
    data object Tickets : Route { override val title = "Tickets" }
    data object Offers : Route { override val title = "Offertes" }
    data object More : Route { override val title = "Meer" }
    data class ProjectDetail(val id: String) : Route { override val title = "Project" }
    data class Chat(val id: String, val name: String) : Route { override val title = name }
    data object NewTicket : Route { override val title = "Nieuw ticket" }
    data object Notifications : Route { override val title = "Meldingen" }
    data object Appointments : Route { override val title = "Afspraken" }
    data object Files : Route { override val title = "Bestanden" }
}

private data class Tab(val route: Route, val label: String, val icon: ImageVector)

private val tabs = listOf(
    Tab(Route.Home, "Overzicht", Icons.Filled.Home),
    Tab(Route.Projects, "Projecten", Icons.Filled.FolderOpen),
    Tab(Route.Tickets, "Tickets", Icons.Filled.SupportAgent),
    Tab(Route.Offers, "Offertes", Icons.Filled.ReceiptLong),
    Tab(Route.More, "Meer", Icons.Filled.Menu),
)

/** Maps a link from a notification ("#tickets") to a screen. */
fun routeForTab(tab: String?): Route = when (tab) {
    "projecten" -> Route.Projects
    "tickets" -> Route.Tickets
    "offertes" -> Route.Offers
    "meldingen" -> Route.Notifications
    "afspraken" -> Route.Appointments
    "bestanden" -> Route.Files
    "instellingen", "profiel" -> Route.More
    else -> Route.Home
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NextApp(vm: AppViewModel, startTab: String?, onTabConsumed: () -> Unit, askNotificationPermission: (Boolean) -> Unit) {
    if (!vm.loggedIn) {
        LoginScreen(vm)
        return
    }

    val stack = remember { mutableStateListOf<Route>(Route.Home) }
    val current = stack.last()
    val snackbar = remember { SnackbarHostState() }
    val navigate: (Route) -> Unit = { stack.add(it) }
    val switchTab: (Route) -> Unit = { stack.clear(); stack.add(it) }

    LaunchedEffect(Unit) { askNotificationPermission(false) }
    LaunchedEffect(startTab) {
        if (startTab != null) {
            val r = routeForTab(startTab)
            if (r in tabs.map { it.route }) switchTab(r) else { switchTab(Route.More); navigate(r) }
            onTabConsumed()
        }
    }
    LaunchedEffect(vm.toast) {
        vm.toast?.let { snackbar.showSnackbar(it); vm.toast = null }
    }
    BackHandler(enabled = stack.size > 1) {
        if (current is Route.Chat) vm.closeThread()
        stack.removeAt(stack.lastIndex)
    }

    val isTab = tabs.any { it.route == current }
    Scaffold(
        containerColor = Ink,
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text(if (current == Route.Home) "Next Solutions" else current.title, fontWeight = FontWeight.SemiBold, maxLines = 1) },
                navigationIcon = {
                    if (!isTab) IconButton(onClick = {
                        if (current is Route.Chat) vm.closeThread()
                        stack.removeAt(stack.lastIndex)
                    }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Terug") }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Ink),
            )
        },
        bottomBar = {
            if (isTab) NavigationBar(containerColor = Surface1) {
                val d = vm.data
                tabs.forEach { tab ->
                    val count = when (tab.route) {
                        Route.Tickets -> d?.tickets?.size ?: 0
                        Route.Offers -> d?.offers?.count { it.code == "open" } ?: 0
                        Route.More -> d?.unread ?: 0
                        else -> 0
                    }
                    NavigationBarItem(
                        selected = current == tab.route,
                        onClick = { switchTab(tab.route) },
                        icon = {
                            BadgedBox(badge = { if (count > 0) Badge { Text("$count") } }) { Icon(tab.icon, contentDescription = null) }
                        },
                        label = { Text(tab.label, fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(indicatorColor = MaterialTheme.colorScheme.primaryContainer, selectedIconColor = Lime, selectedTextColor = Lime),
                    )
                }
            }
        },
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            when (current) {
                Route.Home -> HomeScreen(vm, navigate, switchTab)
                Route.Projects -> ProjectsScreen(vm, navigate)
                Route.Tickets -> TicketsScreen(vm, navigate)
                Route.Offers -> OffersScreen(vm)
                Route.More -> MoreScreen(vm, navigate) { askNotificationPermission(true) }
                is Route.ProjectDetail -> ProjectDetailScreen(vm, current.id)
                is Route.Chat -> ChatScreen(vm, current.id)
                Route.NewTicket -> NewTicketScreen(vm) { stack.removeAt(stack.lastIndex) }
                Route.Notifications -> NotificationsScreen(vm) { tab -> val r = routeForTab(tab); if (r in tabs.map { it.route }) switchTab(r) else navigate(r) }
                Route.Appointments -> AppointmentsScreen(vm)
                Route.Files -> FilesScreen(vm)
            }
        }
    }
}

@Composable
fun LoginScreen(vm: AppViewModel) {
    val context = LocalContext.current
    Column(
        Modifier.fillMaxSize().background(Ink).padding(28.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(Modifier.size(84.dp).clip(RoundedCornerShape(22.dp)).background(Lime), contentAlignment = Alignment.Center) {
            Text("»", color = Ink, fontSize = 48.sp, fontWeight = FontWeight.Black)
        }
        Spacer(Modifier.height(24.dp))
        Text("Next Solutions", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(
            "Je projecten, tickets, offertes en meldingen op één plek. Log in met je Discord-account.",
            color = Muted, textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(32.dp))
        if (vm.loginBusy) {
            CircularProgressIndicator(color = Lime)
            Spacer(Modifier.height(12.dp))
            Text("Bezig met inloggen...", color = Muted)
        } else {
            Button(onClick = { vm.clearError(); Auth.start(context) }, modifier = Modifier.fillMaxWidth().height(54.dp), shape = RoundedCornerShape(16.dp)) {
                Text("Inloggen met Discord", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
        }
        vm.error?.let {
            Spacer(Modifier.height(16.dp))
            Text(it, color = Danger, textAlign = TextAlign.Center)
        }
        Spacer(Modifier.height(24.dp))
        Text("Nog geen klant? Kijk op nextsolutionshq.nl", color = Faint, fontSize = 13.sp, textAlign = TextAlign.Center)
    }
}
