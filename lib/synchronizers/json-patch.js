var jsonpatch = require('fast-json-patch');

var JSONPatchSynchronizer = function (options) {
    if (!(this instanceof JSONPatchSynchronizer)) {
        return new JSONPatchSynchronizer(options);
    }

    this.patchShadow = function (edit, shadowDocument) {
        jsonpatch.apply(shadowDocument.document.content, edit.diff);
        return shadowDocument;
    };

    this.patchDocument = function (edit, document) {
        jsonpatch.apply(document.content, edit.diff);
        return document;
    };

    this.serverDiff = function (document, shadowDocument) {
        return {
            clientVersion: shadowDocument.clientVersion,
            serverVersion: shadowDocument.serverVersion,
            checksum: shadowDocument.checksum,
            diff: jsonpatch.compare(document.content, shadowDocument.document.content)
        };
    };

    this.clientDiff = function (document, shadowDocument) {
        return {
            clientVersion: 0,
            serverVersion: 0,
            checksum: '',
            diff: jsonpatch.compare(document.content, shadowDocument.document.content)
        };
    };

    this.createPatchMessage = function (documentId, clientId, edits) {
        return {
            documentId: documentId,
            clientId: clientId,
            edits: edits
        };
    };

    this.patchMessageFromJson = function () {};

    this.documentFromJson = function () {};

    return this;
};

module.exports = JSONPatchSynchronizer;

// /**
//  * A instance of this class will be able to handle tasks needed to implement
//  * Differential Synchronization for a specific type of documents.
//  *
//  * @param <T> The type of documents that this engine can handle.
//  * @param <S> The type of {@link Edit}s that this synchronizer can handle
//  */
// public interface ServerSynchronizer<T, S extends Edit<? extends Diff>> {

//     /**
//      * Called when the shadow should be patched. Is called when an update is recieved.
//      *
//      * @param edit The edits.
//      * @param shadowDocument the {@link ShadowDocument} to patch
//      * @return {@link ShadowDocument} a new patched shadow document.
//      */
//     ShadowDocument<T> patchShadow(S edit, ShadowDocument<T> shadowDocument);

//     /**
//      * Called when the document should be patched.
//      *
//      * @param edit the edit to use to path the document
//      * @param document the document to be patched.
//      * @return {@link Document} a new patched document.
//      */
//     Document<T> patchDocument(S edit, Document<T> document);

//     /**
//      * The first step in a sync is to produce a an edit for the changes.
//      * The produced edit can then be sent to the opposing side perform an update/sync.
//      *
//      * @param document the document containing
//      * @param shadowDocument the document shadow.
//      * @return {@link Edit} the edit representing the diff between the document and it's shadow document.
//      */
//     S serverDiff(Document<T> document, ShadowDocument<T> shadowDocument);

//     /**
//      * Is called to produce an {@link Edit} of changes coming from a client.
//      *
//      * @param document the server side document .
//      * @param shadowDocument the document shadow containing the client changes.
//      * @return {@link Edit} the edit representing the diff between the document and it's shadow document.
//      */
//     S clientDiff(Document<T> document, ShadowDocument<T> shadowDocument);

//     /**
//      * Creates a new {@link PatchMessage} with the with the type of {@link Edit} that this
//      * synchronizer can handle.
//      *
//      * @param documentId the document identifier for the {@code PatchMessage}
//      * @param clientId the client identifier for the {@code PatchMessage}
//      * @param edits the {@link Edit}s for the {@code PatchMessage}
//      * @return {@link PatchMessage} the created {code PatchMessage}
//      */
//     PatchMessage<S> createPatchMessage(String documentId, String clientId, Queue<S> edits);

//     /**
//      * Creates a {link PatchMessage} by parsing the passed-in json.
//      *
//      * @param json the json representation of a {@code PatchMessage}
//      * @return {@link PatchMessage} the created {code PatchMessage}
//      */
//     PatchMessage<S> patchMessageFromJson(String json);

//     /**
//      * Converts the {@link JsonNode} into a {@link Document} instance.
//      *
//      * @param json the {@link JsonNode} to convert
//      * @return {@link Document} the document representing the contents of the {@link JsonNode} instance.
//      */
//     Document<T> documentFromJson(JsonNode json);

// }
