var assert = require('assert'),
    jsonpatch = require('fast-json-patch'),
    JSONPatchSynchronizer = require('../../lib/synchronizers/json-patch');


describe('JSON Patch Synchronizer Tests', function () {
    describe('Create new JSON Patch Synchronizer', function () {
        it('create without new', function () {
            var jsonPatchSynchronizer = JSONPatchSynchronizer();
            assert.equal(jsonPatchSynchronizer instanceof JSONPatchSynchronizer, true, 'should be true');
        });
    });

    describe('Client Diff', function () {
        it('test the client diff', function () {
            var source, shadow, jsonPatchSynchronizer, diff, validDiff,
                documentId = '1234',
                clientId = 'client1';

            source = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'fletch'
                }
            };

            shadow = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'Fletch'
                }
            };

            jsonPatchSynchronizer = JSONPatchSynchronizer();
            diff = jsonPatchSynchronizer.clientDiff(source, shadow).diff;
            validDiff = jsonpatch.apply(source.content, diff);

            assert.equal(source.content.name, 'Fletch');
            assert.equal(validDiff, true);
        });
    });

    describe('Server Diff', function () {
        it('test the server diff', function () {
            var source, shadow, jsonPatchSynchronizer, diff, validDiff,
                documentId = '1234',
                clientId = 'client1';

            source = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'fletch'
                }
            };

            shadow = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'Fletch'
                }
            };

            jsonPatchSynchronizer = JSONPatchSynchronizer();
            diff = jsonPatchSynchronizer.serverDiff(source, shadow).diff;

            validDiff = jsonpatch.apply(source.content, diff);

            assert.equal(source.content.name, 'Fletch');
            assert.equal(validDiff, true);
        });
    });

    describe('Create Patch Message', function () {
        it('test create patch message', function () {
            var source, shadow, jsonPatchSynchronizer, diff, patchMessage,
                documentId = '1234',
                clientId = 'client1';

            source = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'fletch'
                }
            };

            shadow = {
                documentId: documentId,
                clientId: clientId,
                content: {
                    name: 'Fletch'
                }
            };

            jsonPatchSynchronizer = JSONPatchSynchronizer();
            diff = jsonPatchSynchronizer.serverDiff(source, shadow);

            patchMessage = jsonPatchSynchronizer.createPatchMessage(documentId, clientId, [diff]);

            assert.equal(patchMessage.documentId, documentId);
            assert.equal(patchMessage.clientId, clientId);
            assert.equal(patchMessage.edits.length, 1);
            assert.equal(patchMessage.edits[0].diff, diff.diff);
            assert.equal(JSON.stringify(patchMessage.edits[0].diff), JSON.stringify(diff.diff));
        });
    });
});


/*

    @Test
    public void patchDocument() {
        final String documentId = "1234";
        final ObjectNode source = objectMapper.createObjectNode().put("name", "fletch");
        final DefaultDocument<JsonNode> document = new DefaultDocument<JsonNode>(documentId, source);
        final ObjectNode target = objectMapper.createObjectNode().put("name", "Fletch");
        final JsonPatch patch = JsonDiff.asJsonPatch(source, target);
        final JsonPatchEdit edit = jsonPatchEdit(patch);
        final Document<JsonNode> patched = syncer.patchDocument(edit, document);
        assertThat(patched.content().get("name").asText(), equalTo("Fletch"));
    }

    @Test
    public void patchShadow() {
        final String documentId = "1234";
        final String clientId = "client1";
        final ObjectNode source = objectMapper.createObjectNode().put("name", "fletch");
        final DefaultShadowDocument<JsonNode> shadowDocument = new DefaultShadowDocument<JsonNode>(0, 0,
                new DefaultClientDocument<JsonNode>(documentId, clientId, source));
        final ObjectNode target = objectMapper.createObjectNode().put("name", "Fletch");
        final JsonPatch patch = JsonDiff.asJsonPatch(source, target);
        final JsonPatchEdit edit = jsonPatchEdit(patch);
        final ShadowDocument<JsonNode> patched = syncer.patchShadow(edit, shadowDocument);
        assertThat(patched.document().content().get("name").asText(), equalTo("Fletch"));
    }

    private static JsonPatchEdit jsonPatchEdit(final JsonPatch patch) {
        return JsonPatchEdit.withPatch(patch).checksum("123").build();
    }

    private static JsonPatch jsonPatch() {
        final ObjectNode source = objectMapper.createObjectNode().put("name", "fletch");
        final ObjectNode target = objectMapper.createObjectNode().put("name", "Fletch");
        return JsonDiff.asJsonPatch(source, target);
    }

    private static Queue<JsonPatchEdit> asQueue(final JsonPatchEdit... edits){
        return new LinkedList<JsonPatchEdit>(Arrays.asList(edits));
    }

}
*/
