
// public class DiffMatchPatchServerSynchronizerTest {

//     @Test
//     public void clientDiff() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final Document<String> document = new DefaultDocument<String>("1234", "test");
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "testing");

//         final DiffMatchPatchEdit edit = synchronizer.clientDiff(document, shadowDocument);
//         assertThat(edit.clientVersion(), is(0L));
//         assertThat(edit.serverVersion(), is(0L));
//         assertThat(edit.diff().diffs().size(), is(2));
//         assertThat(edit.diff().diffs().get(0).operation(), is(Operation.UNCHANGED));
//         assertThat(edit.diff().diffs().get(0).text(), is("test"));
//         assertThat(edit.diff().diffs().get(1).operation(), is(Operation.ADD));
//         assertThat(edit.diff().diffs().get(1).text(), is("ing"));
//     }

//     @Test
//     public void serverDiff() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final Document<String> document = new DefaultDocument<String>("1234", "test");
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "testing");

//         final DiffMatchPatchEdit edit = synchronizer.serverDiff(document, shadowDocument);
//         assertThat(edit.clientVersion(), is(0L));
//         assertThat(edit.serverVersion(), is(0L));
//         assertThat(edit.diff().diffs().size(), is(2));
//         assertThat(edit.diff().diffs().get(0).operation(), is(Operation.UNCHANGED));
//         assertThat(edit.diff().diffs().get(0).text(), is("test"));
//         assertThat(edit.diff().diffs().get(1).operation(), is(Operation.DELETE));
//         assertThat(edit.diff().diffs().get(1).text(), is("ing"));
//     }

//     @Test
//     public void patchShadow() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final Document<String> document = new DefaultDocument<String>("1234", "test");
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "testing");

//         final DiffMatchPatchEdit edit = synchronizer.serverDiff(document, shadowDocument);
//         final ShadowDocument<String> patchedShadow = synchronizer.patchShadow(edit, shadowDocument);
//         assertThat(patchedShadow.document().content(), equalTo("test"));
//     }

//     @Test
//     public void patchShadowFromClientDiff() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final Document<String> document = new DefaultDocument<String>("1234", "Beve");
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "I'm the man");

//         final DiffMatchPatchEdit edit = synchronizer.clientDiff(document, shadowDocument);
//         final ShadowDocument<String> patchedShadow = synchronizer.patchShadow(edit, shadowDocument);
//         assertThat(patchedShadow.document().content(), equalTo("I'm the man"));
//     }

//     @Test
//     public void patchShadowFromClientDiffCustomEdit() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "Beve");

//         final DiffMatchPatchEdit edit1 = DiffMatchPatchEdit.withChecksum("bogus")
//                 .delete("B")
//                 .add("I'm th")
//                 .unchanged("e")
//                 .delete("ve")
//                 .add(" man")
//                 .build();
//         final ShadowDocument<String> patchedShadow = synchronizer.patchShadow(edit1, shadowDocument);
//         assertThat(patchedShadow.document().content(), equalTo("I'm the man"));
//     }

//     @Test
//     public void patchDocument() throws Exception {
//         final ServerSynchronizer<String, DiffMatchPatchEdit> synchronizer = new DiffMatchPatchServerSynchronizer();
//         final Document<String> document = new DefaultDocument<String>("1234", "test");
//         final ShadowDocument<String> shadowDocument = shadowDocument("1234", "client1", "testing");

//         final DiffMatchPatchEdit edit = synchronizer.clientDiff(document, shadowDocument);
//         final Document<String> patchedDocument = synchronizer.patchDocument(edit, document);
//         assertThat(patchedDocument.content(), equalTo("testing"));
//     }

//     private static ShadowDocument<String> shadowDocument(final String documentId,
//                                                          final String clientVersion,
//                                                          final String content) {
//         return new DefaultShadowDocument<String>(0L,
//                 0L,
//                 new DefaultClientDocument<String>(documentId, clientVersion, content));

//     }
// }
