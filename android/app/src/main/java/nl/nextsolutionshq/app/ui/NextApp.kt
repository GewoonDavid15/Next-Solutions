package nl.nextsolutionshq.app.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TextButton
import nl.nextsolutionshq.app.Updates
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
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Menu
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
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
import nl.nextsolutionshq.app.Target
import nl.nextsolutionshq.app.t

sealed interface Route {
    val title: String
    data object Home : Route { override val title get() = t("Overzicht", "Overview") }
    data object Projects : Route { override val title get() = t("Projecten", "Projects") }
    data object Social : Route { override val title get() = "Social media" }
    data object Tickets : Route { override val title get() = "Tickets" }
    data object Offers : Route { override val title get() = t("Offertes", "Quotes") }
    data object More : Route { override val title get() = t("Meer", "More") }
    data class ProjectDetail(val id: String) : Route { override val title get() = t("Project", "Project") }
    data class Chat(val id: String, val name: String, val admin: Boolean = false) : Route { override val title get() = name }
    data object NewTicket : Route { override val title get() = t("Nieuw ticket", "New ticket") }
    data object Notifications : Route { override val title get() = t("Meldingen", "Notifications") }
    data object Appointments : Route { override val title get() = t("Afspraken", "Appointments") }
    data object Files : Route { override val title get() = t("Bestanden", "Files") }
    data object Transcripts : Route { override val title get() = t("Gesloten tickets", "Closed tickets") }
    data class Transcript(val id: String, val name: String) : Route { override val title get() = name }
    data object Review : Route { override val title get() = t("Review schrijven", "Write a review") }
    data object Admin : Route { override val title get() = t("Beheer", "Admin") }
    data object AdminLeads : Route { override val title get() = t("Aanvragen", "Requests") }
    data object AdminTickets : Route { override val title get() = t("Alle tickets", "All tickets") }
    data object AdminOffers : Route { override val title get() = t("Alle offertes", "All quotes") }
    data object AdminProjects : Route { override val title get() = t("Projecten bijwerken", "Update projects") }
    data object QuickRepliesEdit : Route { override val title get() = t("Snelle antwoorden", "Quick replies") }
    data object Referral : Route { override val title get() = t("Breng iemand mee", "Refer someone") }
    data object ProfileEdit : Route { override val title get() = t("Profiel bewerken", "Edit profile") }
    data object Checklist : Route { override val title get() = t("Startchecklist", "Start checklist") }
    data class DesignFeedback(val id: String, val name: String) : Route { override val title get() = name }
}

private data class Tab(val route: Route, val label: String, val icon: ImageVector)

/** Maps a link from a notification ("#tickets") to a screen. */
fun routeForTab(tab: String?): Route = when (tab) {
    "projecten" -> Route.Projects
    "social" -> Route.Social
    "tickets" -> Route.Tickets
    "offertes" -> Route.Offers
    "meldingen" -> Route.Notifications
    "afspraken" -> Route.Appointments
    "bestanden" -> Route.Files
    "beheer" -> Route.Admin
    "nieuw-ticket" -> Route.NewTicket
    "instellingen", "profiel" -> Route.More
    else -> Route.Home
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NextApp(
    vm: AppViewModel,
    startTab: String?,
    startTarget: Target?,
    onStartConsumed: () -> Unit,
    askNotificationPermission: (Boolean) -> Unit,
    locked: Boolean,
    unlock: () -> Unit,
) {
    if (!vm.loggedIn) { LoginScreen(vm); return }
    if (locked) { LockScreen(unlock); return }

    val social = vm.data?.social?.active == true
    val tabs = listOf(
        Tab(Route.Home, t("Overzicht", "Home"), Icons.Filled.Home),
        if (social) Tab(Route.Social, "Social", Icons.Filled.Campaign) else Tab(Route.Projects, t("Projecten", "Projects"), Icons.Filled.FolderOpen),
        Tab(Route.Tickets, "Tickets", Icons.Filled.SupportAgent),
        Tab(Route.Offers, t("Offertes", "Quotes"), Icons.AutoMirrored.Filled.ReceiptLong),
        Tab(Route.More, t("Meer", "More"), Icons.Filled.Menu),
    )
    val stack = remember { mutableStateListOf<Route>(Route.Home) }
    val current = stack.last()
    val snackbar = remember { SnackbarHostState() }
    val navigate: (Route) -> Unit = { stack.add(it) }
    val switchTab: (Route) -> Unit = { stack.clear(); stack.add(it) }
    val open: (Route) -> Unit = { r -> if (tabs.any { it.route == r }) switchTab(r) else { if (stack.size > 1) stack.removeRange(1, stack.size); navigate(r) } }
    val back: () -> Unit = {
        if (current is Route.Chat) vm.closeThread()
        stack.removeAt(stack.lastIndex)
    }

    LaunchedEffect(Unit) { askNotificationPermission(false) }
    LaunchedEffect(startTab, startTarget) {
        if (startTab == null && startTarget == null) return@LaunchedEffect
        val target = startTarget
        when {
            target?.kind == "ticket" && target.id != null ->
                open(Route.Chat(target.id, vm.data?.tickets?.find { it.id == target.id }?.name ?: "Ticket"))
            target?.kind == "project" && target.id != null -> open(Route.ProjectDetail(target.id))
            target?.kind == "beheer" -> open(Route.Admin)
            else -> open(routeForTab(startTab))
        }
        onStartConsumed()
    }
    LaunchedEffect(vm.toast) { vm.toast?.let { snackbar.showSnackbar(it); vm.toast = null } }
    val ctx = LocalContext.current
    var updateHidden by remember { mutableStateOf(0) }
    vm.update?.takeIf { it.code > updateHidden && !Updates.dialogShown(ctx, it.code) }?.let { u ->
        val hide = { Updates.markDialogShown(ctx, u.code); updateHidden = u.code }
        AlertDialog(
            onDismissRequest = hide,
            title = { Text(t("Nieuwe versie: ${u.name}", "New version: ${u.name}")) },
            text = { Text(u.notes.ifBlank { t("Er is een nieuwe versie van de app.", "There is a new version of the app.") }) },
            confirmButton = { Button(onClick = { hide(); ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(u.url))) }) { Text(t("Downloaden", "Download")) } },
            dismissButton = { TextButton(onClick = hide) { Text(t("Later", "Later")) } },
        )
    }
    BackHandler(enabled = stack.size > 1, onBack = back)

    val isTab = tabs.any { it.route == current }
    Scaffold(
        containerColor = Ink,
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            Column {
                TopAppBar(
                    title = { Text(if (current == Route.Home) "Next Solutions" else current.title, fontWeight = FontWeight.SemiBold, maxLines = 1) },
                    navigationIcon = { if (!isTab) IconButton(onClick = back) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = t("Terug", "Back")) } },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Ink),
                )
                vm.offlineSince?.let {
                    Text(
                        t("Geen verbinding • gegevens van ${dateTime(it)}", "Offline • data from ${dateTime(it)}"),
                        Modifier.fillMaxWidth().background(Surface2).padding(horizontal = 16.dp, vertical = 6.dp),
                        color = Muted, fontSize = 12.sp,
                    )
                }
            }
        },
        bottomBar = {
            if (isTab) NavigationBar(containerColor = Surface1) {
                val d = vm.data
                tabs.forEach { tab ->
                    val count = when (tab.route) {
                        Route.Tickets -> d?.tickets?.size ?: 0
                        Route.Offers -> d?.offers?.count { it.code == "open" } ?: 0
                        Route.Social -> d?.social?.posts?.count { it.status == "ter-goedkeuring" } ?: 0
                        Route.More -> d?.unread ?: 0
                        else -> 0
                    }
                    NavigationBarItem(
                        selected = current == tab.route,
                        onClick = { switchTab(tab.route) },
                        icon = { BadgedBox(badge = { if (count > 0) Badge { Text("$count") } }) { Icon(tab.icon, contentDescription = null) } },
                        label = { Text(tab.label, fontSize = 11.sp, maxLines = 1) },
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
                Route.Social -> SocialScreen(vm)
                Route.Tickets -> TicketsScreen(vm, navigate)
                Route.Offers -> OffersScreen(vm)
                Route.More -> MoreScreen(vm, navigate) { askNotificationPermission(true) }
                is Route.ProjectDetail -> ProjectDetailScreen(vm, current.id)
                is Route.Chat -> ChatScreen(vm, current.id, current.admin, onClosed = back)
                Route.NewTicket -> NewTicketScreen(vm, back)
                Route.Notifications -> NotificationsScreen(vm) { target, tab ->
                    when {
                        target?.kind == "ticket" && target.id != null -> navigate(Route.Chat(target.id, vm.data?.tickets?.find { it.id == target.id }?.name ?: "Ticket"))
                        target?.kind == "project" && target.id != null -> navigate(Route.ProjectDetail(target.id))
                        target?.kind == "beheer" -> navigate(Route.Admin)
                        else -> open(routeForTab(tab))
                    }
                }
                Route.Appointments -> AppointmentsScreen(vm)
                Route.Files -> FilesScreen(vm, navigate)
                Route.Transcripts -> TranscriptsScreen(vm, navigate)
                is Route.Transcript -> TranscriptScreen(current.id)
                Route.Review -> ReviewScreen(vm, back)
                Route.Admin -> AdminScreen(vm, navigate)
                Route.AdminLeads -> AdminLeadsScreen(vm)
                Route.AdminTickets -> AdminTicketsScreen(vm, navigate)
                Route.AdminOffers -> AdminOffersScreen(vm)
                Route.AdminProjects -> AdminProjectsScreen(vm)
                Route.QuickRepliesEdit -> QuickRepliesScreen()
                Route.Referral -> ReferralScreen(vm)
                Route.ProfileEdit -> ProfileEditScreen(vm, back)
                Route.Checklist -> ChecklistScreen(vm)
                is Route.DesignFeedback -> DesignFeedbackScreen(vm, current.id)
            }
        }
    }
}

@Composable
fun LockScreen(unlock: () -> Unit) {
    Column(Modifier.fillMaxSize().background(Ink).padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(84.dp).clip(RoundedCornerShape(22.dp)).background(Surface2), contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.Lock, null, tint = Lime, modifier = Modifier.size(40.dp))
        }
        Spacer(Modifier.height(20.dp))
        Text(t("App vergrendeld", "App locked"), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(t("Ontgrendel met je vingerafdruk, gezicht of pincode.", "Unlock with your fingerprint, face or PIN."), color = Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        Button(onClick = unlock) { Text(t("Ontgrendelen", "Unlock")) }
    }
}

@Composable
fun LoginScreen(vm: AppViewModel) {
    val context = LocalContext.current
    Column(Modifier.fillMaxSize().background(Ink).padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(84.dp).clip(RoundedCornerShape(22.dp)).background(Lime), contentAlignment = Alignment.Center) {
            Text("»", color = Ink, fontSize = 48.sp, fontWeight = FontWeight.Black)
        }
        Spacer(Modifier.height(24.dp))
        Text("Next Solutions", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text(
            t("Je projecten, tickets, offertes en meldingen op één plek. Log in met je Discord-account.", "Your projects, tickets, quotes and notifications in one place. Log in with your Discord account."),
            color = Muted, textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(32.dp))
        if (vm.loginBusy) {
            CircularProgressIndicator(color = Lime)
            Spacer(Modifier.height(12.dp))
            Text(t("Bezig met inloggen...", "Logging in..."), color = Muted)
        } else {
            Button(onClick = { vm.clearError(); Auth.start(context) }, modifier = Modifier.fillMaxWidth().height(54.dp), shape = RoundedCornerShape(16.dp)) {
                Text(t("Inloggen met Discord", "Log in with Discord"), fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            }
        }
        Spacer(Modifier.height(20.dp))
        EmailLogin(vm)
        vm.error?.let {
            Spacer(Modifier.height(16.dp))
            Text(it, color = Danger, textAlign = TextAlign.Center)
        }
        Spacer(Modifier.height(24.dp))
        Text(t("Nog geen klant? Kijk op nextsolutionshq.nl", "Not a client yet? Visit nextsolutionshq.nl"), color = Faint, fontSize = 13.sp, textAlign = TextAlign.Center)
    }
}

/** Without Discord: log in with a link by email. */
@Composable
private fun EmailLogin(vm: AppViewModel) {
    var open by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    val sent = vm.emailSent
    when {
        sent != null -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(t("Check je mail! We stuurden een inloglink naar $sent. Open hem op deze telefoon.", "Check your email! We sent a login link to $sent. Open it on this phone."), color = Success, textAlign = TextAlign.Center)
            androidx.compose.material3.TextButton(onClick = { vm.resetEmailLogin() }) { Text(t("Ander adres gebruiken", "Use another address")) }
        }
        !open -> androidx.compose.material3.TextButton(onClick = { open = true }) { Text(t("Geen Discord? Log in met je e-mail", "No Discord? Log in with your email")) }
        else -> Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            androidx.compose.material3.OutlinedTextField(
                email, { email = it.trim().take(254) }, label = { Text(t("E-mailadres", "Email address")) }, singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Email),
            )
            androidx.compose.material3.OutlinedButton(
                onClick = { vm.clearError(); vm.loginWithEmail(email) },
                enabled = !vm.loginBusy && Regex("^[^@\\s]+@[^@\\s]+\\.[a-zA-Z]{2,}$").matches(email),
                modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(16.dp),
            ) { Text(t("Stuur me een inloglink", "Email me a login link")) }
        }
    }
}
