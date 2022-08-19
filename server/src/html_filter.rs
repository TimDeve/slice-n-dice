use lazy_static::lazy_static;
use std::{collections::HashSet, error::Error, str};

use lol_html::{
    doc_comments, doctype, element,
    errors::RewritingError,
    html_content::{Comment, Doctype, Element},
    rewrite_str, RewriteStrSettings,
};

lazy_static! {
    static ref ELEMENTS_TO_BE_REMOVED_COMPLETELY: HashSet<&'static str> =
        HashSet::from(["head", "style", "script"]);
}

fn extract_text(el: &mut Element) -> Result<(), Box<dyn Error + Send + Sync>> {
    if ELEMENTS_TO_BE_REMOVED_COMPLETELY.contains(el.tag_name().as_str()) {
        el.remove();
    } else {
        el.remove_and_keep_content();
    };
    Ok(())
}

fn remove_comments(c: &mut Comment) -> Result<(), Box<dyn Error + Send + Sync>> {
    c.remove();
    Ok(())
}

fn remove_doctype(d: &mut Doctype) -> Result<(), Box<dyn Error + Send + Sync>> {
    d.remove();
    Ok(())
}

pub fn to_plain_text(s: &str) -> Result<String, RewritingError> {
    let rewriten_str = rewrite_str(
        s,
        RewriteStrSettings {
            element_content_handlers: vec![element!("*", extract_text)],
            document_content_handlers: vec![
                doc_comments!(remove_comments),
                doctype!(remove_doctype),
            ],
            ..Default::default()
        },
    )?;
    let lines: Vec<&str> = rewriten_str.trim().lines().map(|l| l.trim()).collect();
    Ok(lines.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn to_plain_text_removes_comment() -> anyhow::Result<()> {
        let html = r###"<!--a comment-->"###;
        let expected = r###""###;

        let result = to_plain_text(html)?;

        assert_eq!(result, expected);

        Ok(())
    }

    #[test]
    fn to_plain_text_makes_html_plaintext() -> anyhow::Result<()> {
        let html = r###"
            <!-- Wow much comment -->
            <h1>Hello</h1>
            <p>Some stuff</p>
            More text
        "###;
        let expected = r###"Hello
Some stuff
More text"###;

        let result = to_plain_text(html)?;

        assert_eq!(result, expected.trim());

        Ok(())
    }

    #[test]
    fn to_plain_text_with_a_full_page() -> anyhow::Result<()> {
        let html = str::from_utf8(include_bytes!("../tests/data/example.html"))?;
        let expected = r###"Example Title
This is a paragraph. Not much in it.
And here a link in a paragraph...
"###;

        let result = to_plain_text(html)?;

        assert_eq!(result.trim(), expected.trim());

        Ok(())
    }
}
