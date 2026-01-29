package sh.noro.app

import android.app.assist.AssistStructure
import android.os.CancellationSignal
import android.service.autofill.AutofillService
import android.service.autofill.Dataset
import android.service.autofill.FillCallback
import android.service.autofill.FillRequest
import android.service.autofill.FillResponse
import android.service.autofill.SaveCallback
import android.service.autofill.SaveRequest
import android.view.autofill.AutofillId
import android.view.autofill.AutofillValue
import android.widget.RemoteViews

class NoroAutofillService : AutofillService() {

    override fun onFillRequest(
        request: FillRequest,
        cancellationSignal: CancellationSignal,
        callback: FillCallback
    ) {
        val structure = request.fillContexts.lastOrNull()?.structure ?: run {
            callback.onSuccess(null)
            return
        }

        val fields = parseStructure(structure)

        if (fields.isEmpty()) {
            callback.onSuccess(null)
            return
        }

        val response = buildFillResponse(fields)
        callback.onSuccess(response)
    }

    override fun onSaveRequest(request: SaveRequest, callback: SaveCallback) {
        callback.onSuccess()
    }

    private fun parseStructure(structure: AssistStructure): List<AutofillField> {
        val fields = mutableListOf<AutofillField>()

        for (i in 0 until structure.windowNodeCount) {
            val windowNode = structure.getWindowNodeAt(i)
            parseNode(windowNode.rootViewNode, fields)
        }

        return fields
    }

    private fun parseNode(node: AssistStructure.ViewNode, fields: MutableList<AutofillField>) {
        val hints = node.autofillHints
        val autofillId = node.autofillId

        if (autofillId != null && !hints.isNullOrEmpty()) {
            val type = when {
                hints.any { it.contains("username", ignoreCase = true) } -> FieldType.USERNAME
                hints.any { it.contains("email", ignoreCase = true) } -> FieldType.USERNAME
                hints.any { it.contains("password", ignoreCase = true) } -> FieldType.PASSWORD
                else -> null
            }

            if (type != null) {
                fields.add(AutofillField(autofillId, type))
            }
        }

        for (i in 0 until node.childCount) {
            parseNode(node.getChildAt(i), fields)
        }
    }

    private fun buildFillResponse(fields: List<AutofillField>): FillResponse? {
        if (fields.isEmpty()) return null

        val presentation = RemoteViews(packageName, android.R.layout.simple_list_item_1).apply {
            setTextViewText(android.R.id.text1, "Noro - Autofill")
        }

        val datasetBuilder = Dataset.Builder()
        var hasData = false

        fields.forEach { field ->
            val value = when (field.type) {
                FieldType.USERNAME -> "user@example.com"
                FieldType.PASSWORD -> "password"
            }
            datasetBuilder.setValue(
                field.id,
                AutofillValue.forText(value),
                presentation
            )
            hasData = true
        }

        if (!hasData) return null

        return FillResponse.Builder()
            .addDataset(datasetBuilder.build())
            .build()
    }

    private data class AutofillField(
        val id: AutofillId,
        val type: FieldType
    )

    private enum class FieldType {
        USERNAME,
        PASSWORD
    }
}
