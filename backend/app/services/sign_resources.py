import httpx
import re
from typing import Optional
from urllib.parse import quote


async def fetch_lifeprint_gif(word: str) -> dict:
    """
    Fetch sign language video/GIF from Lifeprint (ASL University).

    Args:
        word: The word to search for

    Returns:
        Dictionary with gif_url (or video_url), page_url, source, found status
    """
    word_lower = word.lower().strip()
    first_letter = word_lower[0] if word_lower else 'a'

    # Normalize word for URL (Lifeprint uses various formats)
    # Try without spaces first, then with hyphens
    word_normalized = word_lower.replace(' ', '')
    word_hyphenated = word_lower.replace(' ', '-')

    # Lifeprint URL patterns - try multiple formats
    url_variants = [
        f"https://www.lifeprint.com/asl101/pages-signs/{first_letter}/{word_normalized}.htm",
        f"https://www.lifeprint.com/asl101/pages-signs/{first_letter}/{word_hyphenated}.htm",
        f"https://www.lifeprint.com/asl101/pages-signs/{first_letter}/{word_lower.replace(' ', '_')}.htm",
    ]

    page_url = url_variants[0]

    result = {
        "word": word,
        "gif_url": None,
        "page_url": page_url,
        "source": "Lifeprint (ASL University)",
        "found": False,
        "alt_sources": [],
        "media_type": "image"
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            # Try multiple URL variants
            html = None
            for url in url_variants:
                response = await client.get(url)
                if response.status_code == 200:
                    html = response.text
                    page_url = url
                    result["page_url"] = page_url
                    break

            if html:
                # Look for video first (Lifeprint now uses MP4 videos)
                video_patterns = [
                    r'<video[^>]*src=["\']([^"\']+\.mp4)["\']',
                    r'<source[^>]+src=["\']([^"\']+\.mp4)["\']',
                    r'src=["\']([^"\']+/videos/[^"\']+\.mp4)["\']',
                    r'src=["\'](\.\./\.\./videos/[^"\']+\.mp4)["\']',
                ]

                for pattern in video_patterns:
                    matches = re.findall(pattern, html, re.IGNORECASE)
                    for match in matches:
                        # Make URL absolute
                        if match.startswith('http'):
                            media_url = match
                        elif match.startswith('../../'):
                            # Relative path like ../../videos/hi.mp4
                            media_url = f"https://www.lifeprint.com/asl101/{match.replace('../../', '')}"
                        elif match.startswith('/'):
                            media_url = f"https://www.lifeprint.com{match}"
                        else:
                            base_path = page_url.rsplit('/', 1)[0]
                            media_url = f"{base_path}/{match}"

                        result["gif_url"] = media_url
                        result["found"] = True
                        result["media_type"] = "video"
                        break

                    if result["found"]:
                        break

                # If no video, look for GIF
                if not result["found"]:
                    gif_patterns = [
                        r'<img[^>]+src=["\']([^"\']*\.gif)["\']',
                        r'src=["\']([^"\']+/signs/[^"\']+\.gif)["\']',
                    ]

                    for pattern in gif_patterns:
                        matches = re.findall(pattern, html, re.IGNORECASE)
                        for match in matches:
                            # Skip tiny icons, navigation gifs, and generic images
                            skip_patterns = [
                                'icon', 'button', 'nav', 'logo', 'banner', 'spacer',
                                'concepts', 'layout', 'menu', 'header', 'footer',
                                'background', 'arrow', 'bullet'
                            ]
                            if any(skip in match.lower() for skip in skip_patterns):
                                continue

                            # Make URL absolute and resolve relative paths
                            if match.startswith('http'):
                                gif_url = match
                            elif match.startswith('../../'):
                                # Resolve relative path like ../../images/sign.gif
                                gif_url = f"https://www.lifeprint.com/asl101/{match.replace('../../', '')}"
                            elif match.startswith('../'):
                                gif_url = f"https://www.lifeprint.com/asl101/pages-signs/{match.replace('../', '')}"
                            elif match.startswith('/'):
                                gif_url = f"https://www.lifeprint.com{match}"
                            else:
                                base_path = page_url.rsplit('/', 1)[0]
                                gif_url = f"{base_path}/{match}"

                            result["gif_url"] = gif_url
                            result["found"] = True
                            result["media_type"] = "image"
                            break

                        if result["found"]:
                            break

    except Exception as e:
        print(f"Error fetching Lifeprint: {e}")

    # Add alternative sources
    result["alt_sources"] = [
        {
            "name": "HandSpeak",
            "url": f"https://www.handspeak.com/word/search/index.php?id={quote(word)}",
            "type": "search"
        },
        {
            "name": "SigningSavvy",
            "url": f"https://www.signingsavvy.com/search/{quote(word)}",
            "type": "search"
        },
        {
            "name": "YouTube",
            "url": f"https://www.youtube.com/results?search_query=ASL+sign+for+{quote(word)}",
            "type": "video_search"
        }
    ]

    return result


async def fetch_handspeak_gif(word: str) -> dict:
    """
    Fetch sign language GIF/video from HandSpeak.

    HandSpeak uses video format, so we return the page URL for embedding.
    """
    word_lower = word.lower().strip()

    # HandSpeak search URL
    search_url = f"https://www.handspeak.com/word/search/index.php?id={quote(word_lower)}"

    result = {
        "word": word,
        "gif_url": None,
        "page_url": search_url,
        "source": "HandSpeak",
        "found": False,
        "alt_sources": []
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(search_url)

            if response.status_code == 200:
                html = response.text

                # Look for video or gif content
                # HandSpeak uses MP4 videos
                video_patterns = [
                    r'<source[^>]+src=["\']([^"\']+\.mp4)["\']',
                    r'<video[^>]+src=["\']([^"\']+\.mp4)["\']',
                    r'<img[^>]+src=["\']([^"\']*\.gif)["\']',
                ]

                for pattern in video_patterns:
                    matches = re.findall(pattern, html, re.IGNORECASE)
                    for match in matches:
                        if match.startswith('http'):
                            result["gif_url"] = match
                        elif match.startswith('/'):
                            result["gif_url"] = f"https://www.handspeak.com{match}"

                        if result["gif_url"]:
                            result["found"] = True
                            break

                    if result["found"]:
                        break

    except Exception as e:
        print(f"Error fetching HandSpeak: {e}")

    return result


async def fetch_sign_gif(word: str) -> dict:
    """
    Fetch sign language GIF from multiple sources.

    Tries Lifeprint first, then HandSpeak.
    """
    # Try Lifeprint first
    result = await fetch_lifeprint_gif(word)

    if result["found"]:
        return result

    # Try HandSpeak as fallback
    handspeak_result = await fetch_handspeak_gif(word)

    if handspeak_result["found"]:
        return handspeak_result

    # Return Lifeprint result with alt sources even if not found
    return result
