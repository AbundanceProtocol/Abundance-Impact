import React from 'react';

export default function CastText ({ text, embeds, mentions }) {
  let textWithUrls = text;

  if (mentions && mentions.length > 0) {
    // console.log(text, mentions)
    // console.log(textWithUrls);

    const replaceUsernamesWithUrls = (text, mentions) => {
      mentions.forEach(mention => {
        const currentMention = `@${mention.username}`
        const currentUrl = `https://impact.abundance.id/${mention.username}`
        const currentUrlText = `<a class="name-font fc-lnk" style="font-weight: 500;" href="${currentUrl}">@${mention.username}</a>`
        textWithUrls = text.replace(currentMention, currentUrlText)
      });
      // console.log(textWithUrls)
      return textWithUrls
    }

    const replaceUrls = (text, embeds) => {
      if (embeds && embeds.length > 0) {
        embeds.forEach(embed => {
          if (embed.type == 'url') {
            const embededUrl = embed.url
            // const currentUrl = `https://impact.abundance.id/${mention.username}`
            const currentUrlText = `<a class="name-font fc-lnk" style="font-weight: 500;" href="${embededUrl}">@${embededUrl}</a>`
            textWithUrls = text.replace(embededUrl, currentUrlText)
            // console.log(textWithUrls)
          }
        });
      }
      return textWithUrls
    }

    textWithUrls = replaceUsernamesWithUrls(text, mentions);
    textWithUrls = replaceUrls(text, embeds);
  }


  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: textWithUrls }} />
    </div>
  );
};

