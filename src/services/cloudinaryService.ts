import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';

const profileImageUploadPreset = 'work_manager_profile_images_dev';

// Tipos para a função de utilidade do Cloudinary com verificação de assinatura de resposta
type CloudinaryUtilsWithResponseVerification = typeof cloudinary.utils & {
  verify_api_response_signature: (
    publicId: string,
    version: number,
    signature: string
  ) => boolean;
};

type ProfileImageUploadSignature = {
  apiKey: string; // Chave da API do Cloudinary
  cloudName: string; // Nome da nuvem do Cloudinary
  signature: string; // Assinatura gerada para autenticação
  timestamp: number; // Timestamp atual em segundos
  uploadPreset: string; // Nome do preset de upload configurado no Cloudinary
};

// Gera uma assinatura para upload de imagem de perfil no Cloudinary
export const createProfileImageUploadSignature = (
  timestamp = Math.floor(Date.now() / 1000)
): ProfileImageUploadSignature => {
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      upload_preset: profileImageUploadPreset,
    },
    env.cloudinaryApiSecret
  );

  return {
    apiKey: env.cloudinaryApiKey,
    cloudName: env.cloudinaryCloudName,
    signature, // Assinatura gerada para autenticação
    timestamp,
    uploadPreset: profileImageUploadPreset,
  };
};

export const deleteProfileImage = async (publicId: string): Promise<void> => {
  if (!publicId.trim()) {
    throw new Error('Profile image public ID is required');
  }

  const response = await cloudinary.uploader.destroy(publicId, {
    invalidate: true, // Invalida o cache da imagem no Cloudinary
    resource_type: 'image', // Tipo de recurso a ser excluído (imagem)
    type: 'upload', // Tipo de upload (upload padrão)
  });

  if (response.result !== 'ok' && response.result !== 'not found') {
    throw new Error('Cloudinary could not delete the profile image');
  }
};

type ProfileImageUploadResponseSignature = {
  publicId: string;
  signature: string;
  version: number;
};

// Verifica se a imagem gerada pelo Cloudinary é válida, comparando a assinatura da resposta com a assinatura esperada
export const verifyProfileImageUploadResponse = ({
  publicId,
  signature,
  version,
}: ProfileImageUploadResponseSignature): boolean => {
  const cloudinaryUtils =
    cloudinary.utils as CloudinaryUtilsWithResponseVerification;

  return cloudinaryUtils.verify_api_response_signature(
    publicId,
    version,
    signature
  );
};

// Constrói a URL da imagem de perfil com base no formato, publicId e versão fornecidos
// O front recebe a URL pronta, porém montamos a URL no back por questões de segurança, para evitar que o front manipule a URL e acesse imagens de outros usuários
export const buildProfileImageUrl = ({
  format,
  publicId,
  version,
}: {
  format: string;
  publicId: string;
  version: number;
}): string =>
  cloudinary.url(publicId, {
    format,
    resource_type: 'image',
    secure: true,
    type: 'upload',
    version,
  });
