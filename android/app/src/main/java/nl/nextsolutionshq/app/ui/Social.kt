package nl.nextsolutionshq.app.ui

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import nl.nextsolutionshq.app.AppViewModel
import nl.nextsolutionshq.app.BuildConfig
import nl.nextsolutionshq.app.PickedFile
import nl.nextsolutionshq.app.SocialPost
import nl.nextsolutionshq.app.t
import nl.nextsolutionshq.app.NextApp as NextApplication

private fun statusLabel(s: String) = when (s) {
    "ter-goedkeuring" -> t("Wacht op jouw akkoord", "Waiting for your approval")
    "goedgekeurd" -> t("Goedgekeurd", "Approved")
    "aanpassing" -> t("Wordt aangepast", "Being changed")
    "gepland" -> t("Ingepland", "Scheduled")
    "geplaatst" -> t("Geplaatst", "Posted")
    else -> s
}

@Composable
fun SocialScreen(vm: AppViewModel) {
    val context = LocalContext.current
    var change by remember { mutableStateOf<SocialPost?>(null) }
    var upload by remember { mutableStateOf(false) }

    DataScreen(vm) { d ->
        val s = d.social
        if (s == null || !s.active) {
            item { EmptyState("📱", t("Nog geen social media", "No social media yet"), t("Laten wij je socials beheren? Kijk op nextsolutionshq.nl/social-media.", "Want us to manage your socials? Visit nextsolutionshq.nl/social-media.")) }
            return@DataScreen
        }
        s.subscription?.let { a ->
            item {
                Panel {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text(a.packageName, fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
                            Pill(if (a.status == "actief") t("Actief", "Active") else a.status, if (a.status == "actief") Success else Muted)
                        }
                        Text(a.price, color = Lime, fontWeight = FontWeight.Bold)
                        if (a.platforms.isNotEmpty()) Text(a.platforms.joinToString(" • "), color = Muted, fontSize = 14.sp)
                        a.nextPayment?.let { KeyValue(t("Volgende betaling", "Next payment"), date(it)) }
                        a.paymentInstruction?.let {
                            Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Surface2).padding(12.dp)) {
                                Column { Text(t("Betalen", "Payment"), fontWeight = FontWeight.SemiBold); Text(it, color = Muted, fontSize = 14.sp) }
                            }
                        }
                    }
                }
            }
        }
        val waiting = s.posts.filter { it.status == "ter-goedkeuring" }
        if (waiting.isNotEmpty()) {
            item { SectionTitle(t("Wacht op jouw akkoord", "Waiting for your approval")) }
            waiting.forEach { p -> item { PostCard(p, onApprove = { vm.judgePost(p.id, true, "") {} }, onChange = { change = p }) } }
        }
        val upcoming = s.posts.filter { it.status != "ter-goedkeuring" && it.date >= System.currentTimeMillis() - 86_400_000 }.sortedBy { it.date }
        if (upcoming.isNotEmpty()) {
            item { SectionTitle(t("Contentkalender", "Content calendar")) }
            upcoming.take(30).forEach { p -> item { PostCard(p, null, null) } }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                SectionTitle(t("Content aanleveren", "Deliver content"))
                TextButton(onClick = { upload = true }) { Text(t("+ Aanleveren", "+ Deliver")) }
            }
        }
        if (s.uploads.isEmpty()) item { Text(t("Stuur foto's, video's of je logo die we mogen gebruiken.", "Send photos, videos or your logo that we may use."), color = Muted, fontSize = 14.sp) }
        s.uploads.take(10).forEach { u ->
            item {
                Panel(onClick = {
                    if (u.link != null) context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(u.link)))
                    else download(context, "${BuildConfig.SITE_URL}/api/portaal/social/bestand?soort=upload&id=${u.id}", u.name)
                }) {
                    Column {
                        Text((if (u.link != null) "🔗 " else "📎 ") + u.name, fontWeight = FontWeight.SemiBold, maxLines = 1)
                        Text(date(u.t) + (u.size?.let { " • " + fileSize(it) } ?: ""), color = Faint, fontSize = 12.sp)
                        if (u.note.isNotBlank()) Text(u.note, color = Muted, fontSize = 13.sp)
                    }
                }
            }
        }
        if (s.reports.isNotEmpty()) {
            item { SectionTitle(t("Maandrapporten", "Monthly reports")) }
            s.reports.forEach { r ->
                item {
                    Panel(onClick = { download(context, "${BuildConfig.SITE_URL}/api/portaal/social/bestand?soort=rapport&id=${r.id}", "rapport-${r.month}.pdf") }) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("📊 ${r.monthName}", fontWeight = FontWeight.SemiBold)
                            if (r.highlights.isNotBlank()) Text(r.highlights, color = Muted, fontSize = 14.sp, maxLines = 3)
                            Text(t("Tik om de PDF te downloaden", "Tap to download the PDF"), color = Lime, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }

    change?.let { p ->
        TextDialog(
            title = t("Aanpassing vragen", "Ask for a change"),
            intro = t("Wat moet er anders aan \"${p.title}\"?", "What should change in \"${p.title}\"?"),
            placeholder = t("Bijv. andere foto, kortere tekst...", "E.g. another photo, shorter text..."),
            minLength = 3,
            onDismiss = { change = null },
        ) { text, done -> vm.judgePost(p.id, false, text) { ok -> done(); if (ok) change = null } }
    }
    if (upload) UploadDialog(vm) { upload = false }
}

@Composable
private fun PostCard(p: SocialPost, onApprove: (() -> Unit)?, onChange: (() -> Unit)?) {
    Panel {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("${p.platform} • ${p.type}", color = Muted, fontSize = 13.sp)
                Pill(statusLabel(p.status), if (p.status == "ter-goedkeuring") Lime else if (p.status == "geplaatst") Success else Muted)
            }
            Text(p.title, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            Text(dayLabel(p.date) + " • " + time(p.date), color = Faint, fontSize = 12.sp)
            if (p.caption.isNotBlank()) Text(p.caption, color = Muted, fontSize = 14.sp, maxLines = if (onApprove != null) 12 else 3)
            if (p.media.isNotEmpty()) Text("🖼️ " + t("${p.media.size} bestand(en)", "${p.media.size} file(s)"), color = Muted, fontSize = 13.sp)
            p.feedback.lastOrNull()?.takeIf { it.text.isNotBlank() }?.let { Text("💬 ${it.text}", color = Faint, fontSize = 13.sp) }
            if (onApprove != null && onChange != null) Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = onApprove, modifier = Modifier.weight(1f)) { Text(t("Goedkeuren", "Approve")) }
                OutlinedButton(onClick = onChange, modifier = Modifier.weight(1f)) { Text(t("Aanpassing", "Change")) }
            }
        }
    }
}

@Composable
private fun UploadDialog(vm: AppViewModel, onDismiss: () -> Unit) {
    var file by remember { mutableStateOf<PickedFile?>(null) }
    var link by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> if (uri != null) scope.launch { file = vm.readPicked(uri) } }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(t("Content aanleveren", "Deliver content")) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = { pick.launch("*/*") }, modifier = Modifier.fillMaxWidth()) {
                    Text(file?.let { "📎 ${it.name.take(28)} (${fileSize(it.bytes.size.toLong())})" } ?: t("Kies een bestand (max. 4 MB)", "Choose a file (max. 4 MB)"))
                }
                Text(t("of deel een link (Google Drive, WeTransfer) voor grotere bestanden:", "or share a link (Google Drive, WeTransfer) for bigger files:"), color = Muted, fontSize = 13.sp)
                OutlinedTextField(link, { link = it.take(500) }, placeholder = { Text("https://...") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(note, { note = it.take(500) }, placeholder = { Text(t("Toelichting (optioneel)", "Note (optional)")) }, minLines = 2, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                enabled = !busy && (file != null || link.trim().startsWith("http")),
                onClick = { busy = true; vm.uploadContent(file, link.trim(), note.trim()) { ok -> busy = false; if (ok) onDismiss() } },
            ) { Text(if (busy) t("Bezig...", "Working...") else t("Versturen", "Send")) }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text(t("Annuleren", "Cancel")) } },
    )
}

/** Downloads a file from the portal with the app token, into the phone's Downloads folder. */
fun download(context: Context, url: String, name: String) {
    val token = (context.applicationContext as NextApplication).tokens.token ?: return
    val safeName = name.replace(Regex("[^A-Za-z0-9._ -]"), "_").take(120).ifBlank { "bestand" }
    val request = DownloadManager.Request(Uri.parse(url))
        .addRequestHeader("Authorization", "Bearer $token")
        .setTitle(name)
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, safeName)
    (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
    Toast.makeText(context, t("Downloaden gestart: $name", "Download started: $name"), Toast.LENGTH_SHORT).show()
}
